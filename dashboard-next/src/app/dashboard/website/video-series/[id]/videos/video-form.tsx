'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface VideoFormProps {
  seriesId: string;
  initialData?: {
    videoId?: string;
    title?: string;
    thumbnail?: string;
    youtubeUrl?: string;
    description?: string;
    duration?: string;
    publishedAt?: string;
    coverImage?: string;
  };
}

export function VideoForm({ seriesId, initialData }: VideoFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    videoId: initialData?.videoId || '',
    title: initialData?.title || '',
    thumbnail: initialData?.thumbnail || '',
    youtubeUrl: initialData?.youtubeUrl || '',
    description: initialData?.description || '',
    duration: initialData?.duration || '',
    publishedAt: initialData?.publishedAt || new Date().toISOString().split('T')[0],
  });

  // Separate state for cover image handling
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData?.coverImage || '');
  const [isExistingCoverImage, setIsExistingCoverImage] = useState<boolean>(
    !!initialData?.coverImage
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Extract YouTube video ID from URL - only extract ID, don't set thumbnail
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle YouTube URL changes and auto-extract video ID (but not thumbnail)
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const videoId = extractVideoId(value) || '';

    // Update form with URL and extracted videoId only
    setFormData(prev => ({
      ...prev,
      youtubeUrl: value,
      videoId: videoId,
    }));

    // Clear related errors
    if (errors.youtubeUrl || errors.videoId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.youtubeUrl;
        delete newErrors.videoId;
        return newErrors;
      });
    }
  };

  // Improved file handling function for cover image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        coverImage: 'Only image files are allowed',
      }));
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        coverImage: 'File size must be less than 5MB',
      }));
      return;
    }

    // Revoke any existing object URL to prevent memory leaks
    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }

    // Store the file object
    setCoverImageFile(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);
    setIsExistingCoverImage(false);

    // Clear any previous errors
    if (errors.coverImage) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coverImage;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    } else if (!extractVideoId(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Invalid YouTube URL';
    }

    if (!formData.videoId) {
      newErrors.videoId = 'Video ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData object for the API call
      const formDataToSend = new FormData();

      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Handle cover image - prioritize file over existing URL
      if (coverImageFile) {
        // Send the new file
        formDataToSend.append('coverImage', coverImageFile);
        console.log('Sending new cover image file');
      } else if (isExistingCoverImage && coverImagePreview) {
        // This is an existing image from the database, send the URL
        formDataToSend.append('coverImageUrl', coverImagePreview);
        console.log('Keeping existing cover image URL', coverImagePreview);
      }

      // For debugging - log form data contents
      for (const pair of formDataToSend.entries()) {
        console.log(pair[0], typeof pair[1], pair[1]);
      }

      const endpoint = initialData?.videoId
        ? `/api/videos/${seriesId}/${initialData.videoId}`
        : `/api/videos/${seriesId}`;

      const method = initialData?.videoId ? 'put' : 'post';

      // Send form data to API
      const response = await axios({
        method,
        url: endpoint,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save video');
      }

      // Clean up any blob URLs
      if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }

      toast.success(
        initialData?.videoId ? 'Video updated successfully' : 'Video added successfully'
      );

      // Refresh the data and redirect
      router.refresh();
      router.push(`/dashboard/website/video-series/${seriesId}/videos`);
    } catch (error) {
      console.error('Error saving video:', error);

      // Display more detailed error message if available
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save video. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title" className={errors.title ? 'text-destructive' : ''}>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="youtubeUrl" className={errors.youtubeUrl ? 'text-destructive' : ''}>
                YouTube URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleVideoUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className={errors.youtubeUrl ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.youtubeUrl ? (
                <p className="text-xs text-destructive">{errors.youtubeUrl}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter a YouTube video URL. The video ID will be extracted automatically.
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="videoId" className={errors.videoId ? 'text-destructive' : ''}>
                Video ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="videoId"
                name="videoId"
                value={formData.videoId}
                onChange={handleChange}
                required
                readOnly
                className={errors.videoId ? 'border-destructive bg-muted' : 'bg-muted'}
                disabled={isLoading}
              />
              {errors.videoId && <p className="text-xs text-destructive">{errors.videoId}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="thumbnail">Thumbnail Title/Caption</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="HH:MM:SS"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="publishedAt">Publication Date</Label>
              <Input
                id="publishedAt"
                name="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="coverImage" className={errors.coverImage ? 'text-destructive' : ''}>
                Cover Image
              </Label>

              <div className="grid gap-3">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => document.getElementById('coverImageFile')?.click()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : coverImageFile || isExistingCoverImage ? (
                      'Change Image'
                    ) : (
                      'Upload Image'
                    )}
                  </Button>
                  <Input
                    id="coverImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>

                {errors.coverImage && (
                  <p className="text-xs text-destructive">{errors.coverImage}</p>
                )}
              </div>

              {/* Always show preview if we have one */}
              {coverImagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    {isExistingCoverImage ? 'Current Image:' : 'Preview:'}
                  </p>
                  <div className="relative h-40 w-full md:w-80 rounded-md overflow-hidden border">
                    <Image
                      src={coverImagePreview}
                      alt="Cover image"
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      style={{ objectFit: 'cover' }}
                      onError={() => {
                        setCoverImagePreview('/placeholder.svg');
                      }}
                    />
                  </div>
                  {coverImageFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      New image selected: {coverImageFile.name} (
                      {Math.round(coverImageFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/website/video-series/${seriesId}/videos`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData?.videoId ? 'Updating...' : 'Adding...'}
            </>
          ) : initialData?.videoId ? (
            'Update Video'
          ) : (
            'Add Video'
          )}
        </Button>
      </div>
    </form>
  );
}
