'use client';

import { RiUploadCloud2Line } from '@remixicon/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BlenderParamsForm } from '@/components/blender-params-form';
import { TaskList } from '@/components/task-list';
import { RenderTask } from '@/types/render-task';

interface UploadResponse {
  message: string;
  fileName: string;
  savedAs: string;
}

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    // Check file size (1GB limit)
    if (file.size > 1024 * 1024 * 1024) {
    setError('File size exceeds 1GB limit');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          setUploadedFile(response.savedAs);
        } else {
          setError('Upload failed');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Upload failed');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('Upload failed');
      setUploading(false);
    }
  };

  const handleRenderSubmit = (task: RenderTask) => {
    // Handle the render task
    console.log('Executing task:', task);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-[1000px] w-full items-center justify-between font-mono text-sm">
        <div className="w-full">
          <div className="w-full mx-auto">

            <div className="mb-8">
              <TaskList />
            </div>
            {!uploadedFile ? (
              <div className="w-full rounded-lg border border-input p-6 space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploading}
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <RiUploadCloud2Line className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Choose a file or drag & drop it here'}
                      </p>
                      <p className="text-xs text-muted-foreground">Up to 1GB</p>
                    </div>
                  </label>

                  {uploading && (
                    <div className="w-full space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-center text-muted-foreground">
                        {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                  >
                    Browse File
                  </Button>
                </div>
              </div>
            ) : (
              <BlenderParamsForm 
                fileName={uploadedFile} 
                onSubmit={(task) => {
                  // Optionally handle the new task
                  console.log('New task created:', task);
                  setUploadedFile(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
