'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BookForm } from '../book-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditBookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/allbooks/${id}`);

        if (response.data.success) {
          setBook(response.data.data);
        } else {
          setError('Failed to load book data');
          toast.error('Error loading book', {
            description: response.data.message,
          });
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book. Please try again later.');
        toast.error('Error loading book');
      } finally {
        setLoading(false);
      }
    };

    if (id && !book) {
      fetchBook();
    }
  }, [id, book]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="border rounded-md p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Edit Book</h1>
          <p className="text-red-500">{error || 'Book not found'}</p>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={() => router.push('/dashboard/books')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </Button>
          <Button onClick={() => window.location.reload()} size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const formData = {
    id: book._id,
    title: book.title,
    author: book.author,
    publishedDate: book.publishedDate
      ? new Date(book.publishedDate).toISOString().slice(0, 10)
      : '',
    genre: book.genre,
    language: book.language,
    ISBN: book.ISBN,
    description: book.description,
    coverImage: book.coverImage,
    pages: book.pages,
    price: book.price,
    stock: {
      soldOut: book.stock?.soldOut || 0,
      stockIn: book.stock?.stockIn || 0,
      available: book.stock?.available || 0,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Book</h1>
        <p className="text-muted-foreground">Update the details of this book.</p>
      </div>

      <BookForm initialData={formData} />
    </div>
  );
}
