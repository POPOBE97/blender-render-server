'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Images } from 'lucide-react';

interface PreviewClientProps {
  taskId: string;
}

export default function PreviewClient({ taskId }: PreviewClientProps) {
  const [images, setImages] = useState<string[]>([]);
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch(`/api/render/video/check?taskId=${taskId}`);
        const data = await response.json();
        setHasVideo(data.exists);
      } catch (err) {
        console.error('Error checking video:', err);
        setHasVideo(false);
      }
    };

    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/render/frames?taskId=${taskId}`);
        const data = await response.json();
        setImages(data.frames);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images');
        setLoading(false);
      }
    };

    checkVideo();
    fetchImages();
  }, [taskId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="grid w-[400px] grid-cols-2">
        <TabsTrigger value="images">
          <Images className="mr-2 h-4 w-4" />
          Images
        </TabsTrigger>
        <TabsTrigger value="video" disabled={!hasVideo}>
          <Film className="mr-2 h-4 w-4" />
          Video
        </TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <Card className="p-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-8 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-[9/16]">
                  <Image
                    src={`/api/render/image?taskId=${taskId}&fileName=${image}`}
                    alt={`Frame ${image}`}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </TabsContent>
      <TabsContent value="video">
        {hasVideo && (
          <Card className="p-4">
            <video
              controls
              className="w-full aspect-video rounded-lg"
              src={`/api/render/video/stream?taskId=${taskId}`}
            />
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
