import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { RenderTask } from '@/types/render-task';

// In-memory store for active tasks
const tasks = new Map<string, RenderTask>();

export class RenderTaskService {
  static async createTask(command: string): Promise<RenderTask> {
    const taskId = uuidv4();
    const workDir = path.join(process.cwd(), 'uploads', 'tasks', taskId);
    const logFile = path.join(workDir, `render.log`);

    // Create uploads directory if it doesn't exist
    await fs.mkdir(workDir, { recursive: true });

    const task: RenderTask = {
      id: taskId,
      command,
      status: 'pending',
      startTime: new Date().toISOString(),
      workDir,
      logFile,
    };

    tasks.set(taskId, task);
    await this.startTask(task);

    return task;
  }

  static async startTask(task: RenderTask): Promise<void> {
    let logStream: fs.FileHandle | undefined;
    try {
      // Create write stream for logs
      await fs.writeFile(task.logFile, 'start task\n');
      logStream = await fs.open(task.logFile, 'a');

      // Split command into args, handling quoted strings properly
      const args = task.command.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => 
        arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
      ) || [];
      
      const cmd = args.shift() || '';

      // Log the command and args for debugging
      await fs.appendFile(task.logFile, `Command: ${cmd}\nArgs: ${JSON.stringify(args)}\n`);

      // Spawn process
      const process = spawn(cmd, args, {
        cwd: task.workDir,
        stdio: 'pipe',
        detached: true
      });

      // Pipe output to log file
      process.stdout.pipe(logStream.createWriteStream());
      process.stderr.pipe(logStream.createWriteStream());

      // Update task status when process exits
      process.on('exit', async (code) => {
        task.status = code === 0 ? 'completed' : 'failed';
        task.endTime = new Date().toISOString();
        if (logStream) {
          await logStream.close();
        }
      });

      process.on('error', async (err) => {
        console.error('Process error:', err);
        task.status = 'failed';
        task.endTime = new Date().toISOString();
        if (logStream) {
          await logStream.close();
        }
      });

      task.pid = process.pid;
      task.status = 'running';
      task.startTime = new Date().toISOString();

      // Unref the process to allow the Node.js process to exit
      process.unref();
    } catch (error) {
      console.error('Task start error:', error);
      if (logStream) {
        await logStream.close();
      }
      throw error;
    }
  }

  static async getTask(taskId: string): Promise<RenderTask | null> {
    const task = tasks.get(taskId);
    if (!task) return null;

    // Read the latest logs
    try {
      const logs = await fs.readFile(task.logFile, 'utf-8');
      return {
        ...task,
        logs,
      } as RenderTask & { logs: string };
    } catch (error) {
      return task;
    }
  }

  static async terminateTask(taskId: string): Promise<boolean> {
    const task = tasks.get(taskId);
    if (!task || !task.pid) return false;

    try {
      process.kill(task.pid);
      task.status = 'failed';
      task.endTime = new Date().toISOString();
      tasks.set(taskId, { ...task });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getAllTasks(): Promise<RenderTask[]> {
    return Array.from(tasks.values());
  }
}
