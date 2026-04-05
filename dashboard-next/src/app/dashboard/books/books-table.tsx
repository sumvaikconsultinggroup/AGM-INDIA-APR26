'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Edit, MoreHorizontal, Trash, BookOpen, CalendarDays, Layers, Info, BookIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

// Interface for book data based on schema
interface Stock {
  soldOut: number;
  stockIn: number;
  available: number;
  lastUpdated: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  publishedDate: string;
  genre: string;
  language: string;
  ISBN: string;
  description: string;
  coverImage?: string;
  pages: number;
  price: number; // Added price field
  stock: Stock;
  createdAt: string;
  updatedAt: string;
}

export function BooksTable() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Fetch books when component mounts
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/allbooks');
      
      if (response.data.success) {
        setBooks(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load books');
        toast.error('Error loading books', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again later.');
      toast.error('Error loading books', {
        description: 'Could not connect to the server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/allbooks/${bookToDelete}`);
      
      if (response.data.success) {
        // Remove the deleted book from the state
        setBooks(books.filter(book => book._id !== bookToDelete));
        toast.success('Book deleted successfully');
      } else {
        toast.error('Failed to delete book', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Error deleting book', {
        description: 'Something went wrong'
      });
    } finally {
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      setLoading(false);
    }
  };

  const openDetailsModal = (book: Book) => {
    setSelectedBook(book);
    setDetailsModalOpen(true);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="hidden md:table-cell">Genre</TableHead>
              <TableHead className="hidden md:table-cell">Pages</TableHead>
              <TableHead>Price</TableHead> {/* Added price column */}
              <TableHead>Stock</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(index => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-[40px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell> {/* Price skeleton */}
                <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell> {/* Stock skeleton */}
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
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
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <BookIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to load books</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchBooks}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!books.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <BookIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No books found</h3>
        <p className="text-sm text-muted-foreground mb-6">Get started by adding your first book to the library.</p>
        <Button asChild>
          <Link href="/dashboard/books/new">Add a new book</Link>
        </Button>
      </div>
    );
  }

  // Function to generate book icon/image
  const getBookIcon = (book: Book) => {
    if (book.coverImage) {
      return (
        <div className="relative w-10 h-10 rounded-md overflow-hidden">
          <Image 
            src={book.coverImage} 
            alt={book.title} 
            fill
            sizes="40px"
            className="object-cover"
            priority={false}
          />
        </div>
      );
    }
    
    const firstLetter = book.title.charAt(0).toUpperCase();
    const colors = [
      "bg-red-100 text-red-600", 
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600"
    ];
    const colorIndex = book.title.length % colors.length;
    
    return (
      <div className={`flex items-center justify-center w-10 h-10 rounded-md ${colors[colorIndex]}`}>
        <span className="text-lg font-bold">{firstLetter}</span>
      </div>
    );
  };

  // Data loaded successfully
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="hidden md:table-cell">Genre</TableHead>
              <TableHead className="hidden md:table-cell">Pages</TableHead>
              <TableHead>Price</TableHead> {/* Added price column */}
              <TableHead>Stock</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(book => (
              <TableRow 
                key={book._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDetailsModal(book)}
              >
                <TableCell className="p-2">
                  {getBookIcon(book)}
                </TableCell>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.language}</TableCell>
                <TableCell className="hidden md:table-cell">{book.genre}</TableCell>
                <TableCell className="hidden md:table-cell">{book.pages}</TableCell>
                <TableCell>₹{book.price}</TableCell> {/* Display price with 2 decimal places */}
                <TableCell>
                  {book.stock.available > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50"
                    >
                      {book.stock.available} In Stock
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openDetailsModal(book);
                      }}>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/books/${book._id}`} onClick={(e) => e.stopPropagation()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(book._id);
                        }}
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

      {/* Book Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedBook && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Avatar className="h-16 w-16">
                      {selectedBook.coverImage ? (
                        <AvatarImage src={selectedBook.coverImage} alt={selectedBook.title} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {selectedBook.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedBook.title}</DialogTitle>
                    <DialogDescription className="text-base">
                      by <span className="font-medium">{selectedBook.author}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      BOOK DETAILS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">ISBN:</div>
                      <div className="text-sm">{selectedBook.ISBN}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Published:</div>
                      <div className="text-sm">{formatDate(selectedBook.publishedDate)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Language:</div>
                      <div className="text-sm">{selectedBook.language}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Genre:</div>
                      <div className="text-sm">{selectedBook.genre}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Pages:</div>
                      <div className="text-sm">{selectedBook.pages}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Price:</div>
                      <div className="text-sm">₹{selectedBook.price}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Layers className="h-4 w-4 mr-2" />
                      STOCK INFORMATION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Total Stock:</div>
                      <div className="text-sm">{selectedBook.stock.stockIn}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Sold:</div>
                      <div className="text-sm">{selectedBook.stock.soldOut}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Available:</div>
                      <div className="text-sm">
                        <Badge
                          variant="outline"
                          className={selectedBook.stock.available > 0 
                            ? "bg-green-50 text-green-700" 
                            : "bg-amber-50 text-amber-700"
                          }
                        >
                          {selectedBook.stock.available > 0 
                            ? `${selectedBook.stock.available} In Stock`
                            : "Out of Stock"
                          }
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Last Updated:</div>
                      <div className="text-sm">{formatDate(selectedBook.stock.lastUpdated)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  DESCRIPTION
                </h3>
                <p className="text-sm whitespace-pre-line">{selectedBook.description}</p>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between mt-6">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleDelete(selectedBook._id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Book
                </Button>
                
                <Button asChild>
                  <Link href={`/dashboard/books/${selectedBook._id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Book
                  </Link>
                </Button>
              </DialogFooter>
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
              This action cannot be undone. This will permanently delete this book from the system.
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
