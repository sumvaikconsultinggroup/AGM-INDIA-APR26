'use client';

import { VideoForm } from '../video-form';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VideoSeriesData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  category: string;
  videoCount: number;
}

export default function AddVideoPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const [seriesData, setSeriesData] = useState<VideoSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the series details to display the name and pass initial data
  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/videoseries/${seriesId}`);

        if (response.data.success) {
          setSeriesData(response.data.data);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch series details');
        }
      } catch (error) {
        console.error('Error fetching series details:', error);
        setError('Failed to load series data. Please try again.');
        toast.error('Failed to load series data');
      } finally {
        setIsLoading(false);
      }
    };

    if (seriesId) {
      fetchSeriesDetails();
    }
  }, [seriesId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading series details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Create initial data with series context
  const initialData = {
    // No videoId since this is a new video
    // Pre-fill the title with series name as a starting point
    title: '',
    // Keep the rest of fields empty for user input
    thumbnail: '',
    youtubeUrl: '',
    description: '',
    duration: '',
    publishedAt: new Date().toISOString().split('T')[0],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/website/video-series/${seriesId}/videos`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-semibold">Add Video</h1>
            <p className="text-muted-foreground">
              Adding video #{(seriesData?.videoCount || 0) + 1} to series:{' '}
              <span className="font-medium text-foreground">{seriesData?.thumbnail}</span>
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6 bg-muted/30">
        <CardContent className="pt-6 pb-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Tip:</strong> Paste a YouTube URL and the Video ID will be automatically
              extracted.
            </p>
            <p>
              Required fields are marked with <span className="text-destructive">*</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <VideoForm seriesId={seriesId} initialData={initialData} />
    </div>
  );
}
