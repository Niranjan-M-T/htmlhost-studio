import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import {
  getAllProjects,
  saveProjectFile,
  saveProjectMetadata,
  getAllProjectFilePaths,
  readProjectFile,
  ProjectMetadata,
} from '@/lib/storage';
import { detectEntryHtml } from '@/lib/entry-detector';
import { repairHtmlAssetPaths } from '@/lib/path-fixer';

export async function GET() {
  const projectsMap = getAllProjects();
  const projects = Object.values(projectsMap).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return NextResponse.json({ success: true, projects });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const nameInput = formData.get('name') as string || 'Untitled Project';
    const files = formData.getAll('files') as File[];
    const zipFile = formData.get('zip') as File | null;

    const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
    let totalBytes = 0;
    let fileCount = 0;
    let projName = nameInput;

    if (zipFile && zipFile.size > 0) {
      projName = zipFile.name.replace(/\.zip$/i, '');
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      const zip = await JSZip.loadAsync(zipBuffer);

      for (const [relativePath, zipObject] of Object.entries(zip.files)) {
        if (zipObject.dir) continue;

        // Skip macOS __MACOSX system junk
        if (relativePath.includes('__MACOSX') || relativePath.startsWith('.')) continue;

        const content = await zipObject.async('nodebuffer');
        saveProjectFile(projectId, relativePath, content);
        totalBytes += content.length;
        fileCount++;
      }
    } else if (files && files.length > 0) {
      if (files.length === 1 && files[0].name.endsWith('.html')) {
        projName = files[0].name.replace(/\.html$/i, '');
      }

      for (const file of files) {
        // webkitRelativePath is sent when a folder is uploaded
        const relPath = (file as any).webkitRelativePath || file.name;
        if (!relPath || relPath.startsWith('.')) continue;

        const content = Buffer.from(await file.arrayBuffer());
        saveProjectFile(projectId, relPath, content);
        totalBytes += content.length;
        fileCount++;
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'No HTML files or ZIP uploaded' },
        { status: 400 }
      );
    }

    // 1. Detect Entry HTML file
    const allFiles = getAllProjectFilePaths(projectId);
    const entryFile = detectEntryHtml(allFiles);

    // 2. Perform automated asset path repair on the entry HTML
    let missingAssets: string[] = [];
    let repairedPathsCount = 0;

    const readResult = readProjectFile(projectId, entryFile);
    if (readResult && typeof readResult.content === 'string') {
      const repairRes = repairHtmlAssetPaths(readResult.content, entryFile, allFiles);
      
      if (repairRes.repairedCount > 0) {
        saveProjectFile(projectId, entryFile, repairRes.repairedHtml);
      }
      
      missingAssets = repairRes.missingAssets;
      repairedPathsCount = repairRes.repairedCount;
    }

    const now = new Date().toISOString();
    const metadata: ProjectMetadata = {
      id: projectId,
      name: projName,
      entryFile,
      createdAt: now,
      updatedAt: now,
      fileCount,
      totalSizeBytes: totalBytes,
      missingAssets,
      repairedPathsCount,
    };

    saveProjectMetadata(metadata);

    const baseUrl = request.nextUrl.origin;
    const shareableUrl = `${baseUrl}/view/${projectId}/${entryFile}`;

    return NextResponse.json({
      success: true,
      project: metadata,
      shareableUrl,
      viewUrl: `/view/${projectId}/${entryFile}`,
    });
  } catch (error: any) {
    console.error('Error uploading project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload project' },
      { status: 500 }
    );
  }
}
