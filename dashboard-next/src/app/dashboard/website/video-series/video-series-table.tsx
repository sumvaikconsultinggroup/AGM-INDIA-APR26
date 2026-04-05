'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, MoreHorizontal, Trash, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Define the type based on your VideoSeries model
interface IVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  coverImage: string;
  youtubeUrl: string;
  description?: string;
  duration?: string;
  publishedAt?: Date;
  views?: number;
  likes?: number;
}

interface IVideoSeries {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  coverImage: string;
  category?: string;
  videoCount: number;
  videos: IVideo[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function useRefreshOnFocus(callback: () => void) {
  useEffect(() => {
    // When document gains focus
    const onFocus = () => {
      console.log('Tab is now in focus, refreshing data...');
      callback();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [callback]);
}

export function VideoSeriesTable() {
  const [videoSeries, setVideoSeries] = useState<IVideoSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchVideoSeries = async () => {
    try {
      setIsLoading(true);
      // Add cache-busting parameter to prevent browser caching
      const response = await axios.get(`/api/videoseries?_t=${Date.now()}`);
      console.log('Fetched video series:', response.data);
      if (response.data.success) {
        setVideoSeries(response.data.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch video series');
      }
    } catch (err) {
      console.error('Error fetching video series:', err);
      setError('Failed to load video series. Please try again.');
      toast.error('Failed to load video series');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchVideoSeries();
  }, [refreshTrigger]);

  // Use our custom hook to refresh on focus
  useRefreshOnFocus(() => {
    setRefreshTrigger(prev => prev + 1);
  });

  const handleDelete = (id: string) => {
    setSeriesToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!seriesToDelete) return;

    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/videoseries/${seriesToDelete}`);

      if (response.data.success) {
        // Remove deleted item from state
        setVideoSeries(prev => prev.filter(series => series._id !== seriesToDelete));
        toast.success('Video series deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete video series');
      }
    } catch (err) {
      console.error('Error deleting video series:', err);
      toast.error('Failed to delete video series');
    } finally {
      setDeleteDialogOpen(false);
      setSeriesToDelete(null);
      setIsLoading(false);
    }
  };

  // Loading skeleton UI
  if (isLoading && videoSeries.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Videos</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(4)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-16 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md border p-6 text-center">
        <div className="text-red-500 mb-2">Failed to load video series</div>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  // Empty state
  if (videoSeries.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-muted-foreground mb-4">No video series found</p>
        <Button asChild>
          <Link href="/dashboard/website/video-series/new">Create your first video series</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Videos</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videoSeries.map(series => (
              <TableRow key={series._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16 rounded overflow-hidden">
                      <Image
                        src={series.coverImage || series.thumbnail}
                        alt={series.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div>
                      <div className="font-medium">{series.thumbnail}</div>

                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {series.description
                          ? series.description.length > 60
                            ? series.description.substring(0, 60) + '...'
                            : series.description
                          : 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{series.category || 'Uncategorized'}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>{series.videoCount} videos</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/website/video-series/${series._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/website/video-series/${series._id}/videos`}>
                          <Video className="mr-2 h-4 w-4" />
                          Manage Videos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(series._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this video series and all
              its videos from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
