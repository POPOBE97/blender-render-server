import { NextResponse } from 'next/server';
import fs from 'fs/promises';
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
      return NextResponse.json({ exists: true });
    } catch {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking video:', error);
    return NextResponse.json(
      { error: 'Failed to check video' },
      { status: 500 }
    );
  }
}
