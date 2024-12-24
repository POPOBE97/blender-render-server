import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size (1GB limit)
    if (file.size > 1024 * 1024 * 1024) {
      console.error('File size exceeds 1GB limit'); 
      return NextResponse.json(
        { error: 'File size exceeds 1GB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    
    // Save the file
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileName: file.name,
      savedAs: fileName,
      path: `/uploads/${fileName}`
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
