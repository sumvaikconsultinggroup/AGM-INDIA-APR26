'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface PodcastFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    videoUrl?: string;
    videoId?: string;
    coverImage?: string;
    category?: string;
    featured?: boolean;
    date?: string;
    duration?: string;
  };
}

const categories = ['Meditation', 'Philosophy', 'Yoga', 'Mindfulness', 'Spirituality', 'Other'];

export function PodcastForm({ initialData }: PodcastFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setThumbnailPreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData?.coverImage || null
  );

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '', // This is now a string, not URL
    videoUrl: initialData?.videoUrl || '',
    videoId: initialData?.videoId || '',
    coverImage: initialData?.coverImage || '',
    category: initialData?.category || 'Meditation',
    featured: initialData?.featured || false,
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    duration: initialData?.duration || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      featured: checked,
    }));
  };

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const videoId = extractVideoId(value) || '';

    setFormData(prev => ({
      ...prev,
      videoUrl: value,
      videoId: videoId,
    }));

    // Generate cover image from YouTube thumbnail when video ID is extracted
    if (videoId && !formData.coverImage) {
      const coverImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setFormData(prev => ({
        ...prev,
        coverImage: coverImageUrl,
      }));
      setCoverImagePreview(coverImageUrl);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      thumbnail: value,
    }));

    // Since thumbnail is now a string, we don't set preview
    setThumbnailPreview(null);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      coverImage: value,
    }));
    setCoverImagePreview(value);
  };

  // Generate thumbnail preview from string (if it contains text)
  const generateThumbnailPreview = (text: string) => {
    if (!text.trim()) return null;

    // Create a simple preview representation
    return (
      <div className="mt-2 h-24 w-32 bg-gray-100 border rounded-md flex items-center justify-center p-2">
        <p className="text-xs text-center text-gray-600 line-clamp-3">{text}</p>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.videoUrl || !formData.videoId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for multipart form submission
      const submitData = new FormData();
      
      // Append all form fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('thumbnail', formData.thumbnail);
      submitData.append('videoUrl', formData.videoUrl);
      submitData.append('videoId', formData.videoId);
      submitData.append('category', formData.category);
      submitData.append('featured', formData.featured.toString());
      submitData.append('date', formData.date);
      submitData.append('duration', formData.duration);
      
      // Handle cover image - if it's a URL string, append it directly
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      let response;
      console.log('Submitting podcast data with FormData');

      if (initialData?._id) {
        // Update existing podcast
        response = await axios.put(`/api/podcasts/${initialData._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new podcast
        response = await axios.post('/api/podcasts', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast.success(
          initialData?._id ? 'Podcast updated successfully' : 'Podcast created successfully'
        );
        router.push('/dashboard/website/podcasts');
        router.refresh();
      } else {
        toast.error(response.data.message || 'An error occurred');
      }
    } catch (error: unknown) {
      console.error('Error submitting podcast:', error);

      const errorMessage = (() => {
        if (error && typeof error === 'object' && 'response' in error) {
          const response = error.response;
          if (response && typeof response === 'object' && 'data' in response) {
            const data = response.data;
            if (
              data &&
              typeof data === 'object' &&
              'message' in data &&
              typeof data.message === 'string'
            ) {
              return data.message;
            }
          }
        }
        return 'Failed to save podcast';
      })();

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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="videoUrl">
                Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Enter a YouTube video URL. The video ID and cover image will be extracted
                automatically.
              </p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="videoId">
                Video ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="videoId"
                name="videoId"
                value={formData.videoId}
                onChange={handleChange}
                required
                readOnly
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="thumbnail">Thumbnail Text</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleThumbnailChange}
                  disabled={isSubmitting}
                  placeholder="Enter thumbnail description or text"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a text description for the thumbnail (not a URL)
                </p>
                {formData.thumbnail && generateThumbnailPreview(formData.thumbnail)}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleCoverImageChange}
                  disabled={isSubmitting}
                  placeholder="Will be auto-generated from YouTube video"
                />
                <p className="text-sm text-muted-foreground">
                  Cover image is automatically generated from YouTube video thumbnail
                </p>
                {coverImagePreview && (
                  <div className="relative mt-2 h-24 w-auto">
                    <Image
                      src={coverImagePreview}
                      alt="Cover image preview"
                      className="rounded-md border object-cover"
                      width={120}
                      height={90}
                      unoptimized={!coverImagePreview.startsWith('/')} // Skip optimization for external URLs
                      onError={() => setCoverImagePreview(null)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <Label htmlFor="date">Publication Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="HH:MM:SS"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Format: HH:MM:SS, e.g., &quot;01:23:45&quot; for 1 hour, 23 minutes, and 45 seconds
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={handleSwitchChange}
                disabled={isSubmitting}
              />
              <Label htmlFor="featured">Featured Podcast</Label>
              <p className="text-sm text-muted-foreground ml-2">
                Featured podcasts will be displayed prominently on the website.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/website/podcasts')}
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
            'Update Podcast'
          ) : (
            'Create Podcast'
          )}
        </Button>
      </div>
    </form>
  );
}
