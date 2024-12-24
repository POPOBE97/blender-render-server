import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface RenderProgressProps {
  taskId: string;
  onComplete?: () => void;
}

interface LogData {
  content: string;
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
  completedFrames?: number;
}

export function RenderProgress({ taskId, onComplete }: RenderProgressProps) {
  const [logData, setLogData] = useState<LogData>({ content: '', progress: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await fetch(`/api/render/log?taskId=${taskId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch log');
        }
        const data = await response.json();
        setLogData(data);

        // If progress is 100%, call onComplete
        if (data.progress === 100 && onComplete) {
          onComplete();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch log');
      }
    };

    // Poll for updates every second
    const interval = setInterval(fetchLog, 1000);
    return () => clearInterval(interval);
  }, [taskId, onComplete]);

  return (
    <div className="space-y-2">
      <div className='flex flex-row items-center gap-2'>
        <Progress value={logData.progress} className="flex-1" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {logData.completedFrames ?? 0}/{logData.totalFrames ?? 0} frames
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
