import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const fileName = searchParams.get('fileName');

    if (!taskId || !fileName) {
      return NextResponse.json(
        { error: 'Task ID and filename are required' },
        { status: 400 }
      );
    }

    const imagePath = path.join(process.cwd(), 'uploads', 'tasks', taskId, 'output', fileName);

    try {
      const imageBuffer = await fs.readFile(imagePath);
      const response = new NextResponse(imageBuffer);
      
      // Set content type based on file extension
      const ext = path.extname(fileName).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 
                         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                         'application/octet-stream';
      
      response.headers.set('Content-Type', contentType);
      return response;
    } catch (error) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
