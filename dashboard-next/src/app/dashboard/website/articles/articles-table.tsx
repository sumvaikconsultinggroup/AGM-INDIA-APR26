'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Add Image import
import { Edit, MoreHorizontal, Trash, ExternalLink, Clock, X, Eye, Calendar } from 'lucide-react';
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

// Add Dialog components for the view modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

// Interface matching the IArticle model
interface Article {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  link?: string;
  category?: string;
  publishedDate?: string;
  readTime?: number;
  createdAt: string;
  updatedAt: string;
}

export function ArticlesTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // Add state for the details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Fetch articles from the API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/articles');
        if (response.data.success) {
          setArticles(response.data.data);
        } else {
          toast.error('Error loading articles');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleDelete = (id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      const response = await axios.delete(`/api/articles/${articleToDelete}`);

      if (response.data.success) {
        // Remove the deleted article from state
        setArticles(articles.filter(article => article._id !== articleToDelete));
        toast.success('Article deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('An error occurred while deleting the article');
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  // Function to open the details modal
  const handleViewDetails = (article: Article) => {
    setSelectedArticle(article);
    setDetailsModalOpen(true);
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
              <TableHead className="hidden md:table-cell">Published</TableHead>
              <TableHead className="hidden md:table-cell">Read Time</TableHead>
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
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No articles found</h3>
        <p className="text-muted-foreground mt-1">Get started by creating a new article.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/website/articles/new">Create Article</Link>
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
              <TableHead className="hidden md:table-cell">Published</TableHead>
              <TableHead className="hidden md:table-cell">Read Time</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map(article => (
              <TableRow key={article._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16">
                      <Image
                        src={article.coverImage || '/placeholder.svg'}
                        alt={article.title}
                        fill
                        sizes="64px"
                        className="rounded object-cover"
                        priority={false}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {article.description.length > 50
                          ? `${article.description.substring(0, 50)}...`
                          : article.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {article.category ? (
                    <Badge variant="outline">{article.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(article.publishedDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {article.readTime ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{article.readTime} min read</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Not specified</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(article)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/website/articles/${article._id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {article.link && (
                          <DropdownMenuItem asChild>
                            <a href={article.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Link
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(article._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Article Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl p-0">
          {selectedArticle && (
            <>
              {/* Article Image Banner */}
              <div className="relative w-full h-52 overflow-hidden rounded-t-lg">
                {/* Close button positioned on the image */}
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                {selectedArticle.coverImage ? (
                  <div className="relative w-full h-52">
                    <Image
                      src={selectedArticle.coverImage}
                      alt={selectedArticle.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {selectedArticle.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content section with padding */}
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{selectedArticle.title}</DialogTitle>
                  <DialogDescription>
                    {selectedArticle.category && (
                      <Badge variant="outline" className="mt-2">
                        {selectedArticle.category}
                      </Badge>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid gap-4">
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Publication Date</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(selectedArticle.publishedDate)}
                            </p>
                          </div>
                        </div>

                        {selectedArticle.readTime && (
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Read Time</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedArticle.readTime} minute
                                {selectedArticle.readTime !== 1 ? 's' : ''} read
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start">
                          <div>
                            <h4 className="font-semibold">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                              {selectedArticle.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleDelete(selectedArticle._id);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Article
                  </Button>

                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/website/articles/${selectedArticle._id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Article
                      </Link>
                    </Button>

                    {selectedArticle.link && (
                      <Button asChild>
                        <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Link
                        </a>
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this article from the
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
