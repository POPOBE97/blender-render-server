import { NextResponse } from 'next/server';
import { RenderTaskService } from '@/services/render-task';
import { getBlenderPath } from '@/utils/blender-path';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Replace 'blender' with the correct path and update file path
    const blenderPath = getBlenderPath();
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Replace both the blender command and update the file path to be absolute
    const fullCommand = command
      .replace(/^blender\s/, `${blenderPath} `)
      .replace(/\/uploads\//, `${uploadDir}/`);

    console.log('Full command:', fullCommand); // For debugging

    const task = await RenderTaskService.createTask(fullCommand);

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to create render task:', error);
    return NextResponse.json(
      { error: 'Failed to create render task' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const task = await RenderTaskService.getTask(taskId);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(task);
    }

    const tasks = await RenderTaskService.getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to get render tasks:', error);
    return NextResponse.json(
      { error: 'Failed to get render tasks' },
      { status: 500 }
    );
  }
}
