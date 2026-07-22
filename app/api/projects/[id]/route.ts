import { NextRequest, NextResponse } from 'next/server';
import { getProject, getProjectTree, deleteProjectStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  const tree = getProjectTree(id);
  const baseUrl = request.nextUrl.origin;
  const shareableUrl = `${baseUrl}/view/${id}/${project.entryFile}`;

  return NextResponse.json({
    success: true,
    project,
    tree,
    shareableUrl,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteProjectStorage(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Project deleted successfully' });
}
