'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { PodcastForm } from '../podcast-form';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

interface Podcast {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  videoId?: string;
  coverImage?: string;
  category?: string;
  featured?: boolean;
  date?: string;
  duration?: string;
}

export default function Page() {
  const params = useParams();
  const paramId = params.id as string;
  const router = useRouter();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/podcasts/${paramId}`);

        if (response.data.success) {
          setPodcast(response.data.data);
        } else {
          toast.error(response.data.message || 'Failed to load podcast');
          setError('Failed to load podcast');
        }
      } catch (err) {
        console.error('Error fetching podcast:', err);
        toast.error("Could not load podcast. It may have been deleted or doesn't exist.");
        setError('Podcast not found');
        setTimeout(() => router.push('/dashboard/website/podcasts'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [paramId, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full rounded-md" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="rounded-full bg-red-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold">Podcast Not Found</h3>
        <p className="text-center text-muted-foreground">
          We couldn&apos;t find the podcast you&apos;re looking for.
          <br />
          You&apos;ll be redirected to the podcasts page shortly.
        </p>
        <Button onClick={() => router.push('/dashboard/website/podcasts')} className="mt-2">
          Go back to podcasts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Podcast</h1>
        <p className="text-muted-foreground">Update the details of this podcast.</p>
      </div>

      {podcast && <PodcastForm initialData={podcast} />}
    </div>
  );
}
