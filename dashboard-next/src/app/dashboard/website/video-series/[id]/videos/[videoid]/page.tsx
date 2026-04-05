'use client';
import { VideoForm } from '../video-form';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Define interfaces for our data structure
interface VideoData {
  videoId: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  description?: string;
  duration?: string;
  publishedAt?: string;
  coverImage?: string;
}

interface VideoSeries {
  _id: string;
  title: string;
  videos: VideoData[];
}

export default function EditVideoPage() {
  const params = useParams();
  const seriesId = params.id as string;
  const videoId = params.videoid as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true);
        // Fetch the entire video series to get the specific video
        const response = await axios.get(`/api/videoseries/${seriesId}`);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch video series');
        }

        const seriesData: VideoSeries = response.data.data;

        // Find the specific video by ID
        const video = seriesData.videos.find(v => v.videoId === videoId);

        if (!video) {
          throw new Error('Video not found in this series');
        }

        setVideoData(video);
        setError(null);
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [seriesId, videoId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load video data. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Video</h1>
        <p className="text-muted-foreground">Update the details of this video.</p>
      </div>

      <VideoForm seriesId={seriesId} initialData={videoData} />
    </div>
  );
}
