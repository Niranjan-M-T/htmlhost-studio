import { NextRequest, NextResponse } from 'next/server';
import {
  getProject,
  readProjectFile,
  saveProjectFile,
  saveProjectMetadata,
  getAllProjectFilePaths,
} from '@/lib/storage';
import { repairHtmlAssetPaths } from '@/lib/path-fixer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ success: false, error: 'File path required' }, { status: 400 });
  }

  const result = readProjectFile(id, filePath);
  if (!result) {
    return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    path: filePath,
    content: typeof result.content === 'string' ? result.content : result.content.toString('base64'),
    isBinary: typeof result.content !== 'string',
    mimeType: result.mimeType,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { path: filePath, content, isBinary } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing path or content' },
        { status: 400 }
      );
    }

    const fileBuffer = isBinary
      ? Buffer.from(content, 'base64')
      : Buffer.from(content, 'utf-8');

    saveProjectFile(id, filePath, fileBuffer);

    // Update project metadata & re-evaluate entry HTML missing assets if applicable
    const allFiles = getAllProjectFilePaths(id);
    let missingAssets = project.missingAssets;
    let repairedPathsCount = project.repairedPathsCount;

    if (filePath === project.entryFile || filePath.endsWith('.html')) {
      const readRes = readProjectFile(id, project.entryFile);
      if (readRes && typeof readRes.content === 'string') {
        const repairRes = repairHtmlAssetPaths(readRes.content, project.entryFile, allFiles);
        missingAssets = repairRes.missingAssets;
      }
    }

    const updatedMetadata = {
      ...project,
      updatedAt: new Date().toISOString(),
      fileCount: allFiles.length,
      missingAssets,
      repairedPathsCount,
    };

    saveProjectMetadata(updatedMetadata);

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      project: updatedMetadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update file' },
      { status: 500 }
    );
  }
}
