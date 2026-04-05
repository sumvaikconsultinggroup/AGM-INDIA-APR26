'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, MoreHorizontal, Trash, Star, StarOff, ExternalLink, Play } from 'lucide-react';
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
import axios from 'axios';
import { toast } from 'sonner';

// Interface matching the IPodcast model
interface Podcast {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  videoId?: string;
  coverImage?: string;
  category?: string;
  featured?: boolean;
  date?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export function PodcastsTable() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);

  // Fetch podcasts from the API
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/podcasts');
        if (response.data.success) {
          setPodcasts(response.data.data);
        } else {
          toast.error('Error loading podcasts');
        }
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        toast.error('Failed to load podcasts');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const handleDelete = (id: string) => {
    setPodcastToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!podcastToDelete) return;

    try {
      const response = await axios.delete(`/api/podcasts/${podcastToDelete}`);

      if (response.data.success) {
        // Remove the deleted podcast from state
        setPodcasts(podcasts.filter(podcast => podcast._id !== podcastToDelete));
        toast.success('Podcast deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete podcast');
      }
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast.error('An error occurred while deleting the podcast');
    } finally {
      setDeleteDialogOpen(false);
      setPodcastToDelete(null);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(`/api/podcasts/${id}/featured`, {
        featured: !currentStatus,
      });

      if (response.data.success) {
        // Update the podcast in state
        setPodcasts(
          podcasts.map(podcast =>
            podcast._id === id ? { ...podcast, featured: !currentStatus } : podcast
          )
        );
        toast.success(`Podcast ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update podcast');
      }
    } catch (error) {
      console.error('Error updating podcast:', error);
      toast.error('An error occurred while updating the podcast');
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(i => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-16 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
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

  if (podcasts.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No podcasts found</h3>
        <p className="text-muted-foreground mt-1">Get started by creating a new podcast.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/website/podcasts/new">Create Podcast</Link>
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
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {podcasts.map(podcast => (
              <TableRow key={podcast._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16">
                      <Image
                        src={podcast.coverImage || '/placeholder-podcast.jpg'}
                        alt={podcast.title}
                        fill
                        sizes="64px"
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{podcast.title}</div>
                      {podcast.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {podcast.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {podcast.category ? (
                    <Badge variant="outline">{podcast.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(podcast.date)}</TableCell>
                <TableCell className="hidden md:table-cell">{podcast.duration || 'N/A'}</TableCell>
                <TableCell>
                  {podcast.featured ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                    >
                      Featured
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
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
                        <Link href={`/dashboard/website/podcasts/${podcast._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={podcast.videoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleFeatured(podcast._id, !!podcast.featured)}
                      >
                        {podcast.featured ? (
                          <>
                            <StarOff className="mr-2 h-4 w-4" />
                            Remove from Featured
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Add to Featured
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(podcast._id)}
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
              This action cannot be undone. This will permanently delete this podcast from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
