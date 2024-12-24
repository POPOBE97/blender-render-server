import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const taskDir = path.join(process.cwd(), 'uploads', 'tasks', taskId);
    const outputDir = path.join(taskDir, 'output');
    const videoPath = path.join(taskDir, 'output.mp4');

    // Check if frames exist
    try {
      await fs.access(outputDir);
    } catch {
      return NextResponse.json(
        { error: 'No rendered frames found' },
        { status: 404 }
      );
    }

    // Use ffmpeg to generate video from frames
    const command = [
      'ffmpeg',
      '-y', // Overwrite output file if it exists
      '-framerate', '24',
      '-pattern_type', 'glob',
      '-i', `"${path.join(outputDir, '*.png')}"`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      videoPath
    ].join(' ');

    try {
      await execAsync(command);
      return NextResponse.json({ success: true, videoPath });
    } catch (error) {
      console.error('Failed to generate video:', error);
      return NextResponse.json(
        { error: 'Failed to generate video' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in video generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
