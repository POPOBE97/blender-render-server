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

    const outputDir = path.join(process.cwd(), 'uploads', 'tasks', taskId, 'output');

    try {
      const files = await fs.readdir(outputDir);
      
      // Filter for image files and sort them
      const frames = files
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      return NextResponse.json({ frames });
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json({ frames: [] });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error listing frames:', error);
    return NextResponse.json(
      { error: 'Failed to list frames' },
      { status: 500 }
    );
  }
}
