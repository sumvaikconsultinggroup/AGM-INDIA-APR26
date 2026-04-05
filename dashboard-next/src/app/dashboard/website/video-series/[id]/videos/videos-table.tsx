'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, MoreHorizontal, Trash, ExternalLink } from 'lucide-react';
import axios from 'axios';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Interface for individual videos based on your VideoSeries model
interface IVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  coverImage?: string;
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
  coverImage?: string;
  category?: string;
  videoCount: number;
  videos: IVideo[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VideosTableProps {
  seriesId: string;
}

export function VideosTable({ seriesId }: VideosTableProps) {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch videos from the API when component mounts
  useEffect(() => {
    const fetchVideoSeries = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/videoseries/${seriesId}`);
        console.log('Fetched video series:', response.data);
        if (response.data.success) {
          // Extract videos array from the video series
          const videoSeriesData: IVideoSeries = response.data.data;
          setVideos(videoSeriesData.videos || []);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch video series');
        }
      } catch (err) {
        console.error('Error fetching video series:', err);
        setError('Failed to load videos. Please try again.');
        toast.error('Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoSeries();
  }, [seriesId]);

  const handleDelete = (id: string) => {
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;

    try {
      setIsUpdating(true);

      // Filter out the video to be deleted
      const updatedVideos = videos.filter(video => video.videoId !== videoToDelete);

      // Update the video series on the server
      const response = await axios.put(`/api/videoseries/${seriesId}`, {
        videos: updatedVideos,
        videoCount: updatedVideos.length,
      });

      if (response.data.success) {
        // Update local state to remove the deleted video
        setVideos(updatedVideos);
        toast.success('Video deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      toast.error('Failed to delete video');
    } finally {
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      setIsUpdating(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead className="hidden md:table-cell">Published</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(4)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-6" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-12" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
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
        <div className="text-red-500 mb-2">Failed to load videos</div>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-muted-foreground mb-4">No videos found in this series</p>
        <Button asChild>
          <Link href={`/dashboard/website/video-series/${seriesId}/videos/new`}>
            Add your first video
          </Link>
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
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead className="hidden md:table-cell">Published</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow key={video.videoId}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <span className="font-medium text-center">{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-12 rounded overflow-hidden">
                      <Image
                        src={video.coverImage|| video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{video.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {video.description
                          ? video.description.split(' ').slice(0, 6).join(' ') +
                            (video.description.split(' ').length > 6 ? '...' : '')
                          : 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{video.duration || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(video.publishedAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {typeof video.views === 'number' ? video.views.toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/website/video-series/${seriesId}/videos/${video.videoId}/`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on YouTube
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(video.videoId)}
                        disabled={isUpdating}
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
              This action cannot be undone. This will permanently remove this video from the series.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isUpdating}
            >
              {isUpdating ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
