export interface RenderTask {
  id: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  workDir: string;
  logFile: string;
  pid?: number;
}
