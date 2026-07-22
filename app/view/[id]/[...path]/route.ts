import { NextRequest, NextResponse } from 'next/server';
import { readProjectFile } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const fileRelPath = resolvedParams.path.join('/');

  const result = readProjectFile(id, fileRelPath);

  if (!result) {
    return new NextResponse(`File not found: ${fileRelPath}`, { status: 404 });
  }

  const { content, mimeType } = result;

  return new NextResponse(content as any, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
