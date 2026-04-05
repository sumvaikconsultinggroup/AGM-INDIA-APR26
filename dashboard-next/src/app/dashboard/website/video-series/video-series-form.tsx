'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Youtube, CheckCircle, AlertCircle, Upload, RefreshCw } from 'lucide-react';

interface VideoSeriesFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    coverImage?: string;
    category?: string;
    videos?: PlaylistVideo[];
  };
}

interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  coverImage?: string;
  youtubeUrl: string;
  duration?: string;
  publishedAt: string;
  views?: number;
  likes?: number;
  position: number;
}

 export interface YouTubePlaylistItemsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubePlaylistItem[];
}

export interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
    videoOwnerChannelTitle?: string;
    videoOwnerChannelId?: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}




const categories = ['Meditation', 'Yoga', 'Philosophy', 'Mindfulness', 'Spirituality', 'Other'];

export function VideoSeriesForm({ initialData }: VideoSeriesFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>(initialData?.videos || []);
  const [playlistId, setPlaylistId] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setFetchedPlaylistData] = useState<YouTubePlaylistItemsResponse | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    category: initialData?.category || 'Meditation',
  });

  // Cover image handling
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData?.coverImage || '');
  const [isExistingCoverImage, setIsExistingCoverImage] = useState<boolean>(
    !!initialData?.coverImage
  );

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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Improved file handling function
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

  // Transform YouTube API response to our format
  const transformYouTubeData = (youtubeResponse: YouTubePlaylistItemsResponse): { videos: PlaylistVideo[], title: string, description: string } => {
    const videos: PlaylistVideo[] = youtubeResponse.items
      .filter((item: YouTubePlaylistItem) => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
      .map((item: YouTubePlaylistItem) => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails?.maxres?.url || 
                  item.snippet.thumbnails?.high?.url || 
                  item.snippet.thumbnails?.medium?.url || 
                  item.snippet.thumbnails?.default?.url || '',
        youtubeUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        publishedAt: item.snippet.publishedAt,
        position: item.snippet.position,
      }));

    // Extract playlist title from channel title or use first video title as base
    const playlistTitle = youtubeResponse.items[0]?.snippet?.channelTitle 
      ? `${youtubeResponse.items[0].snippet.channelTitle} Video Series`
      : 'YouTube Playlist';

    return {
      videos: videos.sort((a, b) => a.position - b.position), // Sort by position
      title: playlistTitle,
      description: `Imported playlist with ${videos.length} videos`
    };
  };

  // Fetch playlist data from YouTube API
  const fetchPlaylistData = async (playlistIdInput: string) => {
    try {
      setIsLoading(true);
      
      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!API_KEY) {
        throw new Error('Missing YouTube API key. Set NEXT_PUBLIC_YOUTUBE_API_KEY.');
      }
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistIdInput}&maxResults=50&key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No videos found in this playlist or playlist is private');
      }

      // Transform the data
      const transformedData = transformYouTubeData(data);
      
      // Store the fetched data
      setFetchedPlaylistData(data);
      setPlaylistTitle(transformedData.title);
      setPlaylistVideos(transformedData.videos);

      // Auto-fill form data from playlist
      setFormData(prev => ({
        ...prev,
        title: transformedData.title,
        description: transformedData.description,
      }));

      // Set cover image preview from first video
      if (transformedData.videos[0]?.thumbnail) {
        setCoverImagePreview(transformedData.videos[0].thumbnail);
        setIsExistingCoverImage(false);
      }

      toast.success(`Successfully imported ${transformedData.videos.length} videos from playlist`);

    } catch {
      // console.error('Error fetching playlist:', error);
      // toast.error(error.message || 'Failed to fetch playlist data. Please check the playlist ID and try again.');
      setPlaylistVideos([]);
      setPlaylistTitle('');
      setFetchedPlaylistData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistFetch = async () => {
    if (!playlistId.trim()) {
      toast.error('Please enter a YouTube playlist ID');
      return;
    }

    await fetchPlaylistData(playlistId.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData object for the API call
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('category', formData.category);

      // Handle cover image - prioritize file over existing URL
      if (coverImageFile) {
        formDataToSend.append('coverImage', coverImageFile);
      } else if (isExistingCoverImage && coverImagePreview) {
        formDataToSend.append('coverImage', coverImagePreview);
      } else if (coverImagePreview && !isExistingCoverImage) {
        // This might be a YouTube thumbnail URL, send it as imageUrl
        formDataToSend.append('imageUrl', coverImagePreview);
      }

      // Add videos data if importing from playlist
      if (activeTab === 'auto-fetch' && playlistVideos.length > 0) {
        formDataToSend.append('videos', JSON.stringify(playlistVideos));
        formDataToSend.append('videoCount', playlistVideos.length.toString());
      } else {
        formDataToSend.append('videoCount', '0');
      }

      // Use POST or PUT based on whether we have an ID
      const url = initialData?.id ? `/api/videoseries/${initialData.id}` : '/api/videoseries';
      const method = initialData?.id ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save video series');
      }

      toast.success(
        `Video series ${initialData?.id ? 'updated' : 'created'} successfully${
          playlistVideos.length > 0 ? ` with ${playlistVideos.length} videos` : ''
        }`
      );

      // Navigate back to video series list
      router.push('/dashboard/website/video-series');
      router.refresh();
    } catch {
      console.error('Error saving video series:');
      toast.error('Failed to save video series');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="auto-fetch">YouTube Playlist ID</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Video Series Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Enter thumbnail description"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value => handleSelectChange('category', value)}
                      disabled={isLoading}
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
                        <Upload className="h-4 w-4 mr-2" />
                        {coverImageFile || isExistingCoverImage ? 'Change Image' : 'Upload Image'}
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

                    {errors.coverImage && <p className="text-xs text-destructive">{errors.coverImage}</p>}
                  </div>

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
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 320px"
                          unoptimized
                          onError={() => {
                            setCoverImagePreview('/placeholder.svg');
                          }}
                        />
                      </div>
                      {coverImageFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          New image selected: {coverImageFile.name} ({Math.round(coverImageFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/website/video-series')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialData?.id ? 'Updating...' : 'Creating...'}
                      </>
                    ) : initialData?.id ? (
                      'Update Video Series'
                    ) : (
                      'Create Video Series'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-fetch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Auto-Fetch from YouTube Playlist ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="playlistId">
                  YouTube Playlist ID <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="playlistId"
                    value={playlistId}
                    onChange={e => setPlaylistId(e.target.value)}
                    placeholder="PLM7H2RjmE7GGoh8Saz2mI7TX51WmU4naN"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handlePlaylistFetch}
                    disabled={isLoading || !playlistId.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Fetch Videos
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter just the playlist ID (e.g., PLM7H2RjmE7GGoh8Saz2mI7TX51WmU4naN) to automatically fetch all videos with their metadata and save them to the database.
                </p>
              </div>

              {playlistVideos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Playlist Fetched Successfully</h3>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">{playlistTitle || formData.title}</h4>
                    <p className="text-sm text-green-600 mt-1">
                      Found {playlistVideos.length} videos in this playlist
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Playlist ID: {playlistId}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Videos to be saved:</h4>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {playlistVideos.map((video, index) => (
                        <div key={video.videoId} className="flex gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                          <Image
                            src={video.thumbnail || '/placeholder.svg'}
                            alt={video.title}
                            width={80}
                            height={48}
                            className="object-cover rounded"
                            unoptimized
                            onError={e => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm line-clamp-1">{video.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {video.description || 'No description available'}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>Video ID: {video.videoId}</span>
                              <span>{formatDate(video.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-3">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={value => handleSelectChange('category', value)}
                        disabled={isLoading}
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

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/website/video-series')}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          `Save Series with ${playlistVideos.length} Videos`
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {playlistId && playlistVideos.length === 0 && !isLoading && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-yellow-700">
                    Click &quot;Fetch Videos&quot; to import videos from the provided playlist ID.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
