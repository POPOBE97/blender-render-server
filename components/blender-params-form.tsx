import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RenderTask } from '@/types/render-task';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface BlenderParams {
  engine: 'CYCLES' | 'EEVEE';
  cyclesDevice: 'CPU' | 'CUDA' | 'OPTIX' | 'HIP' | 'ONEAPI' | 'METAL';
  outputFormat: 'PNG' | 'JPEG' | 'OPEN_EXR';
  frameStart: number;
  frameEnd: number;
}

const defaultParams: BlenderParams = {
  engine: 'CYCLES',
  cyclesDevice: 'OPTIX',
  outputFormat: 'PNG',
  frameStart: 1,
  frameEnd: 1,
};

interface BlenderParamsFormProps {
  fileName: string;
  onSubmit?: (task: RenderTask) => void;
}

export function BlenderParamsForm({ fileName, onSubmit }: BlenderParamsFormProps) {
  const [params, setParams] = useLocalStorage<BlenderParams>('blender-params', defaultParams);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildCommand = () => {
    const command = [
      'blender',
      '-b', `/uploads/${fileName}`,
      '-E', params.engine,
      '-o', './output/render_',
      '-F', params.outputFormat,
      '-s', params.frameStart.toString(),
      '-e', params.frameEnd.toString(),
    ];

    command.push('-x', '1');  // Enable file extensions

    command.push('-a')

    if (params.engine === 'CYCLES') {
      command.push('--');
      command.push('--cycles-device', params.cyclesDevice);
    }

    return command.join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: buildCommand(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start render task');
      }

      const task = await response.json();
      onSubmit?.(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start render task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Render Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Render Engine</Label>
            <Select
              value={params.engine}
              onValueChange={(value) => setParams({ ...params, engine: value as 'CYCLES' | 'EEVEE' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select render engine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CYCLES">Cycles</SelectItem>
                <SelectItem value="EEVEE">Eevee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {params.engine === 'CYCLES' && (
            <>
              <div className="space-y-2">
                <Label>Device</Label>
                <Select
                  value={params.cyclesDevice}
                  onValueChange={(value) => setParams({ ...params, cyclesDevice: value as 'CPU' | 'CUDA' | 'OPTIX' | 'HIP' | 'ONEAPI' | 'METAL' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select render device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPU">CPU</SelectItem>
                    <SelectItem value="CUDA">CUDA (NVIDIA GPU)</SelectItem>
                    <SelectItem value="OPTIX">OptiX (NVIDIA RTX GPU)</SelectItem>
                    <SelectItem value="HIP">HIP (AMD GPU)</SelectItem>
                    <SelectItem value="ONEAPI">ONEAPI</SelectItem>
                    <SelectItem value="METAL">METAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={params.outputFormat}
              onValueChange={(value) => setParams({ ...params, outputFormat: value as 'PNG' | 'JPEG' | 'OPEN_EXR' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PNG">PNG</SelectItem>
                <SelectItem value="JPEG">JPEG</SelectItem>
                <SelectItem value="OPEN_EXR">OpenEXR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frame Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={params.frameStart || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1);
                  setParams({ ...params, frameStart: value });
                }}
                min={1}
                placeholder="Start"
              />
              <Input
                type="number"
                value={params.frameEnd || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1);
                  setParams({ ...params, frameEnd: value });
                }}
                min={1}
                placeholder="End"
              />
            </div>
          </div>

          <div className="pt-4">
            <Label className="text-muted-foreground">Generated Command:</Label>
            <pre className="mt-2 rounded-lg bg-muted p-4 text-sm font-mono overflow-x-auto">
              {buildCommand()}
            </pre>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Starting Render...' : 'Start Render'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
