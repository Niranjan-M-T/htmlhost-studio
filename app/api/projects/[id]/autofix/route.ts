import { NextRequest, NextResponse } from 'next/server';
import {
  getProject,
  readProjectFile,
  saveProjectFile,
  saveProjectMetadata,
  getAllProjectFilePaths,
} from '@/lib/storage';
import { repairHtmlAssetPaths } from '@/lib/path-fixer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  const allFiles = getAllProjectFilePaths(id);
  const entryFile = project.entryFile;

  const readResult = readProjectFile(id, entryFile);
  if (!readResult || typeof readResult.content !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Entry HTML file could not be read' },
      { status: 400 }
    );
  }

  const repairResult = repairHtmlAssetPaths(readResult.content, entryFile, allFiles);

  if (repairResult.repairedCount > 0) {
    saveProjectFile(id, entryFile, repairResult.repairedHtml);
  }

  const updatedMetadata = {
    ...project,
    updatedAt: new Date().toISOString(),
    missingAssets: repairResult.missingAssets,
    repairedPathsCount: project.repairedPathsCount + repairResult.repairedCount,
  };

  saveProjectMetadata(updatedMetadata);

  return NextResponse.json({
    success: true,
    repairedCount: repairResult.repairedCount,
    repairs: repairResult.repairs,
    missingAssets: repairResult.missingAssets,
    project: updatedMetadata,
  });
}
