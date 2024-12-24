import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Film, Eye } from 'lucide-react';
import { RenderTask } from '@/types/render-task';
import { RenderProgress } from '@/components/render-progress';
import { ScrollArea } from './ui/scroll-area';

export function TaskList() {
  const [tasks, setTasks] = useState<RenderTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'running':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/render');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateVideo = async (taskId: string) => {
    try {
      const response = await fetch('/api/render/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      
      // Handle success (e.g., show a notification)
    } catch (error) {
      console.error('Error generating video:', error);
      // Handle error (e.g., show an error notification)
    }
  };

  const handlePreview = (taskId: string) => {
    // Open preview in a new tab
    window.open(`/preview/${taskId}`, '_blank');
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='px-8'>
      <CardHeader className="pb-3 px-2">
        <CardTitle>Render Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Task ID</TableHead>
                <TableHead className="w-[100px]">Start Time</TableHead>
                <TableHead className="w-[100px]">End Time</TableHead>
                <TableHead className="w-[300px]">Progress</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="w-[100px]">
                    <Badge variant={getBadgeVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[120px] font-mono">
                    {task.id.split('-')[0]}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    {new Date(task.startTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    {task.endTime ? new Date(task.endTime).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell className="w-[300px]">
                    {task.status === 'running' && (
                      <RenderProgress taskId={task.id} />
                    )}
                  </TableCell>
                  <TableCell className="w-[100px] text-right">
                    {task.status === 'completed' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleGenerateVideo(task.id)}
                            className="cursor-pointer"
                          >
                            <Film className="mr-2 h-4 w-4" />
                            <span>Generate Video</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePreview(task.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Preview</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
