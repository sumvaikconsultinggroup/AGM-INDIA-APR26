'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { VideosTable } from './videos-table';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Define the interface for the video series data
interface VideoSeries {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  coverImage?: string;
  category?: string;
  videoCount: number;
}

export default function ManageVideosPage() {
  const params = useParams();
  const paramId = params.id as string;
  
  const [videoSeries, setVideoSeries] = useState<VideoSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch video series data when component mounts
  useEffect(() => {
    const fetchVideoSeries = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/videoseries/${paramId}`);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch video series');
        }
        
        setVideoSeries(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching video series:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video series data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideoSeries();
  }, [paramId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-[180px] mb-2" />
            <Skeleton className="h-4 w-[240px]" />
          </div>
          <Skeleton className="h-10 w-[110px]" />
        </div>
        
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !videoSeries) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/website/video-series">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to video series</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Manage Videos</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load video series. Please try again.'}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/website/video-series">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to video series</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Manage Videos</h1>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">{videoSeries.thumbnail}</h2>
          <p className="text-muted-foreground">
            {videoSeries.description || 'Manage videos in this series.'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/website/video-series/${paramId}/videos/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Video
          </Link>
        </Button>
      </div>

      <VideosTable seriesId={paramId} />
    </div>
  );
}
