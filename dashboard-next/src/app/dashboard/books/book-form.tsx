'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface BookFormProps {
  initialData?: {
    id?: string;
    title?: string;
    author?: string;
    publishedDate?: string;
    genre?: string;
    language?: string;
    ISBN?: string;
    description?: string;
    coverImage?: string;
    purchaseUrl?: string;
    pages?: number;
    price?: number;
    stock?: {
      soldOut?: number;
      stockIn?: number;
      available?: number;
    };
  };
}

interface BookFormData {
  title: string;
  author: string;
  publishedDate: string;
  genre: string;
  language: string;
  ISBN: string;
  description: string;
  purchaseUrl: string;
  coverImage?: FileList;
  pages: number;
  price: number;
  stockIn: number;
  soldOut: number;
  available: number;
}

const languages = ['English', 'Hindi', 'Sanskrit', 'Bengali', 'Tamil', 'Other'];
const genres = [
  'Spirituality',
  'Philosophy',
  'Meditation',
  'Yoga',
  'Biography',
  'Self-Help',
  'Health',
  'History',
  'Other'
];

export function BookForm({ initialData }: BookFormProps) {

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImage || null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    
  } = useForm<BookFormData>({
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      publishedDate: initialData?.publishedDate || '',
      genre: initialData?.genre || '',
      language: initialData?.language || 'English',
      ISBN: initialData?.ISBN || '',
      description: initialData?.description || '',
      purchaseUrl: initialData?.purchaseUrl || '',
      pages: initialData?.pages || 0,
      price: initialData?.price || 0,
      stockIn: initialData?.stock?.stockIn || 0,
      soldOut: initialData?.stock?.soldOut || 0,
      available: initialData?.stock?.available || 0,
    },
    mode: 'onBlur'
  });


  // Watch for file changes to generate preview
  const imageFile = watch('coverImage');
  
  // Update preview when file changes
  if (imageFile && imageFile[0] && !imagePreview?.includes(imageFile[0].name)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(imageFile[0]);
  }

  const onSubmit: SubmitHandler<BookFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('publishedDate', new Date(data.publishedDate).toISOString());
      formData.append('genre', data.genre);
      formData.append('language', data.language);
      formData.append('ISBN', data.ISBN);
      formData.append('description', data.description);
      formData.append('purchaseUrl', data.purchaseUrl || '');
      formData.append('pages', data.pages.toString());
      formData.append('price', data.price.toString()); // Add price to form data
      
      // Stock information
      formData.append('stock[stockIn]', data.stockIn.toString());
      formData.append('stock[soldOut]', data.soldOut.toString());
      formData.append('stock[available]', data.available.toString());
      formData.append('stock[lastUpdated]', new Date().toISOString());
      
      // Only append image if it exists
      if (data.coverImage && data.coverImage[0]) {
        formData.append('coverImage', data.coverImage[0]);
      }
      
      let response;
      
      // Check if we're updating or creating
      if (initialData?.id) {
        // Update existing book with PUT request
        response = await axios.put(`/api/allbooks/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Book updated:', response.data);
      } else {
        // Create new book with POST request
        response = await axios.post('/api/allbooks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Book created:', response.data);
      }
      
      if (response.data.success) {
        toast.success(
          initialData?.id ? 'Book updated successfully' : 'Book added successfully',
          { description: 'Success' }
        );
        
        // Navigate back to books list
        router.push('/dashboard/books');
      } else {
        // Handle API error response format
        if (response.data.error) {
          toast.error('Validation error', { 
            description: response.data.error 
          });
          return;
        }
        
        // Handle API validation errors object if present
        if (response.data.validationErrors) {
          const errorFields = Object.keys(response.data.validationErrors);
          
          // Show validation errors as toasts
          errorFields.forEach((field, index) => {
            const delay = index * 200; // Stagger toasts slightly
            setTimeout(() => {
              toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} error`, {
                description: response.data.validationErrors[field]
              });
            }, delay);
          });
          return;
        }
        
        // General error message
        toast.error('Error saving book', { 
          description: response.data.error || 'Unknown error occurred'
        });
      }
      
    } catch {
      toast.error('An unexpected error occurred while saving the book', {
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate available books automatically
  const calculateAvailable = () => {
    const stockIn = Number(watch('stockIn') || 0);
    const soldOut = Number(watch('soldOut') || 0);
    const available = stockIn - soldOut;
    setValue('available', available >= 0 ? available : 0);
  };

  // Watch for changes in stockIn and soldOut to update available
  const watchStockIn = watch('stockIn');
  const watchSoldOut = watch('soldOut');

  // Update available whenever stockIn or soldOut changes
  if (watchStockIn !== undefined && watchSoldOut !== undefined) {
    calculateAvailable();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            {/* Book Details */}
            <div className="grid gap-3">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Book title is required' })}
                aria-invalid={errors.title ? 'true' : 'false'}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  {...register('author', { required: 'Author name is required' })}
                  aria-invalid={errors.author ? 'true' : 'false'}
                />
                {errors.author && (
                  <p className="text-sm text-red-500">{errors.author.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="publishedDate">Published Date</Label>
                <Input
                  id="publishedDate"
                  type="date"
                  {...register('publishedDate', { required: 'Publication date is required' })}
                  aria-invalid={errors.publishedDate ? 'true' : 'false'}
                />
                {errors.publishedDate && (
                  <p className="text-sm text-red-500">{errors.publishedDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="genre">Genre</Label>
                <Select
                  defaultValue={initialData?.genre}
                  onValueChange={(value) => setValue('genre', value)}
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p className="text-sm text-red-500">{errors.genre.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="language">Language</Label>
                <Select
                  defaultValue={initialData?.language || 'English'}
                  onValueChange={(value) => setValue('language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(language => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-sm text-red-500">{errors.language.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="ISBN">ISBN</Label>
                <Input
                  id="ISBN"
                  {...register('ISBN', { required: 'ISBN is required' })}
                  aria-invalid={errors.ISBN ? 'true' : 'false'}
                />
                {errors.ISBN && (
                  <p className="text-sm text-red-500">{errors.ISBN.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="pages">Number of Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  {...register('pages', { 
                    required: 'Page count is required',
                    min: { value: 1, message: 'Pages must be at least 1' },
                    valueAsNumber: true
                  })}
                  aria-invalid={errors.pages ? 'true' : 'false'}
                />
                {errors.pages && (
                  <p className="text-sm text-red-500">{errors.pages.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                    valueAsNumber: true
                  })}
                  aria-invalid={errors.price ? 'true' : 'false'}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="purchaseUrl">Buy Link</Label>
                <Input
                  id="purchaseUrl"
                  type="url"
                  placeholder="https://www.amazon.in/..."
                  {...register('purchaseUrl', {
                    validate: (value) =>
                      !value ||
                      /^https?:\/\/.+/i.test(value) ||
                      'Buy link must start with http:// or https://',
                  })}
                  aria-invalid={errors.purchaseUrl ? 'true' : 'false'}
                />
                <p className="text-xs text-muted-foreground">
                  Add the marketplace or publisher URL where this book can be purchased. AvdheshanandG Mission only displays this external link and is not the seller.
                </p>
                {errors.purchaseUrl && (
                  <p className="text-sm text-red-500">{errors.purchaseUrl.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                {...register('coverImage', {
                  validate: {
                    fileSize: (value) => {
                      if (value && value[0] && value[0].size > 5 * 1024 * 1024) {
                        return 'File size must be less than 5MB';
                      }
                      return true;
                    },
                    fileType: (value) => {
                      if (value && value[0] && !value[0].type.includes('image/')) {
                        return 'File must be an image';
                      }
                      return true;
                    },
                  },
                })}
              />
              {errors.coverImage && (
                <p className="text-sm text-red-500">{errors.coverImage.message}</p>
              )}
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2 rounded border p-2">
                  <div className="relative h-40 w-full">
                    <Image 
                      src={imagePreview} 
                      alt="Cover preview" 
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-contain rounded"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                rows={4}
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Stock Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Stock Information</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="grid gap-3">
                  <Label htmlFor="stockIn">Total Stock</Label>
                  <Input
                    id="stockIn"
                    type="number"
                    {...register('stockIn', { 
                      required: 'Total stock is required',
                      min: { value: 0, message: 'Cannot be negative' },
                      valueAsNumber: true 
                    })}
                    aria-invalid={errors.stockIn ? 'true' : 'false'}
                  />
                  {errors.stockIn && (
                    <p className="text-sm text-red-500">{errors.stockIn.message}</p>
                  )}
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="soldOut">Sold</Label>
                  <Input
                    id="soldOut"
                    type="number"
                    {...register('soldOut', { 
                      required: 'Sold quantity is required',
                      min: { value: 0, message: 'Cannot be negative' },
                      valueAsNumber: true 
                    })}
                    aria-invalid={errors.soldOut ? 'true' : 'false'}
                  />
                  {errors.soldOut && (
                    <p className="text-sm text-red-500">{errors.soldOut.message}</p>
                  )}
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="available">Available (Auto-calculated)</Label>
                  <Input
                    id="available"
                    type="number"
                    {...register('available')}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard/books')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
}
