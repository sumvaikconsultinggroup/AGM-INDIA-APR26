'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';
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

interface ArticleFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    coverImage?: string;
    link?: string;
    category?: string;
    publishedDate?: string;
    readTime?: number;
  };
}

const categories = ['Meditation', 'Philosophy', 'Yoga', 'Mindfulness', 'Spirituality', 'Other'];

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImage || null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    link: initialData?.link || '',
    category: initialData?.category || 'Meditation',
    publishedDate: initialData?.publishedDate
      ? new Date(initialData.publishedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    readTime: initialData?.readTime || 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'readTime' ? Number.parseInt(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data for file upload
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title);
      apiFormData.append('description', formData.description);
      apiFormData.append('link', formData.link);
      apiFormData.append('category', formData.category);
      apiFormData.append('publishedDate', new Date(formData.publishedDate).toISOString());
      apiFormData.append('readTime', formData.readTime.toString());

      if (imageFile) {
        apiFormData.append('coverImage', imageFile);
      }

      let response;
      if (initialData?._id) {
        // Update existing article
        response = await axios.put(`/api/articles/${initialData._id}`, apiFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new article
        response = await axios.post('/api/articles', apiFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast.success(
          initialData?._id ? 'Article updated successfully' : 'Article created successfully'
        );
        router.push('/dashboard/website/articles');
        router.refresh(); // Refresh the articles list
      } else {
        toast.error(response.data.message || 'An error occurred');
      }
    } catch (error: unknown) {
      console.error('Error submitting article:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : 'Failed to save article';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="link">Article Link</Label>
              <Input
                id="link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com/articles/..."
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Link to the full article content (optional)
              </p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="coverImage"
                  name="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {imagePreview && (
                  <div className="relative mt-2">
                    <div className="relative h-40 w-full">
                      <Image
                        src={imagePreview}
                        alt="Cover image preview"
                        className="rounded-md object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        onError={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="grid gap-3">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleSelectChange('category', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="publishedDate">Publication Date</Label>
                <Input
                  id="publishedDate"
                  name="publishedDate"
                  type="date"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  name="readTime"
                  type="number"
                  min="1"
                  value={formData.readTime}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/website/articles')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">{initialData?._id ? 'Updating...' : 'Creating...'}</span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : initialData?._id ? (
            'Update Article'
          ) : (
            'Create Article'
          )}
        </Button>
      </div>
    </form>
  );
}
