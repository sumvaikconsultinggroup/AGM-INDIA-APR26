'use client';
import { useEffect, useState } from 'react';
import { VideoSeriesForm } from '../video-series-form';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoSeries {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  category: string;
}

export default function EditVideoSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [videoSeries, setVideoSeries] = useState<VideoSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoSeries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/videoseries/${id}`);
        if (response.data.success) {
          setVideoSeries(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch video series');
        }
      } catch (err) {
        console.error('Error fetching video series:', err);
        setError(
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'Failed to fetch video series details'
        );
        toast.error('Error loading video series');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoSeries();
  }, [id]);

  // Handle going back to the video series list
  const handleBack = () => {
    router.push('/dashboard/website/video-series');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Edit Video Series</h1>
          <p className="text-muted-foreground">Update the details of this video series.</p>
        </div>

        <Button variant="outline" onClick={handleBack}>
          Back to All Series
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading video series...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-medium text-destructive">Error</h2>
              <p>{error}</p>
              <Button onClick={handleBack}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      ) : videoSeries ? (
        <VideoSeriesForm initialData={{
          id: videoSeries._id,
          title: videoSeries.title,
          description: videoSeries.description || '',
          thumbnail: videoSeries.thumbnail || '',
          coverImage: videoSeries.coverImage || '',
          category: videoSeries.category || '',
        }} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-medium">Video Series Not Found</h2>
              <p>The requested video series could not be found.</p>
              <Button onClick={handleBack}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
