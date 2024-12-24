import { NextResponse } from 'next/server';
import { RenderTaskService } from '@/services/render-task';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const success = await RenderTaskService.terminateTask(taskId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to terminate task' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to terminate render task:', error);
    return NextResponse.json(
      { error: 'Failed to terminate render task' },
      { status: 500 }
    );
  }
}
