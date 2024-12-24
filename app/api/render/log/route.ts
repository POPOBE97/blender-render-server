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

    const logFile = path.join(process.cwd(), 'uploads', 'tasks', taskId, 'render.log');
    
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      
      // Parse the log content to extract progress
      const lines = content.split('\n');
      let currentFrame = 0;
      let totalFrames = 0;
      let progress = 0;

      // Get total frames from command args (usually in the third line)
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (line.startsWith('Args:')) {
          const args = JSON.parse(line.replace('Args:', '').trim());
          const startIndex = args.indexOf('-s');
          const endIndex = args.indexOf('-e');
          if (startIndex !== -1 && endIndex !== -1) {
            const startFrame = parseInt(args[startIndex + 1]);
            const endFrame = parseInt(args[endIndex + 1]);
            totalFrames = endFrame - startFrame + 1;
            break;
          }
        }
      }

      // Count completed frames by looking for "Saved:" lines
      let completedFrames = 0;
      for (const line of lines) {
        if (line.includes('Saved:')) {
          completedFrames++;
        }
      }

      // Find current frame
      for (const line of lines.reverse()) {
        const frameMatch = line.match(/Fra:(\d+)/);
        if (frameMatch) {
          currentFrame = parseInt(frameMatch[1]);
          break;
        }
      }

      // Calculate progress
      if (totalFrames > 0) {
        progress = (completedFrames / totalFrames) * 100;
      }

      return NextResponse.json({
        content: lines.slice(-50).join('\n'), // Return last 50 lines
        progress,
        currentFrame,
        totalFrames,
        completedFrames,
      });
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json({ content: '', progress: 0 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to read log file:', error);
    return NextResponse.json(
      { error: 'Failed to read log file' },
      { status: 500 }
    );
  }
}
