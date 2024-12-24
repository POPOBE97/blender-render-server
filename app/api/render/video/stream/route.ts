import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const videoPath = path.join(process.cwd(), 'uploads', 'tasks', taskId, 'output.mp4');

    try {
      await fs.access(videoPath);
      const stat = statSync(videoPath);
      const fileSize = stat.size;
      const range = request.headers.get('range');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const stream = createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
        };
        return new NextResponse(stream as any, { status: 206, headers: head });
      }

      const stream = createReadStream(videoPath);
      const head = {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      };
      return new NextResponse(stream as any, { headers: head });
    } catch (error) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    );
  }
}
