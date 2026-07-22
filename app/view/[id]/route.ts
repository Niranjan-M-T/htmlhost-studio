import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) {
    return new NextResponse('Project not found', { status: 404 });
  }

  const entryFile = project.entryFile || 'index.html';
  const targetUrl = new URL(`/view/${id}/${entryFile}`, request.url);
  return NextResponse.redirect(targetUrl);
}
