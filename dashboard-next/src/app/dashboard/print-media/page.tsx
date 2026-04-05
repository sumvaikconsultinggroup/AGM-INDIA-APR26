'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  Search,
  Loader2,
} from 'lucide-react';

interface PrintMediaItem {
  _id: string;
  title: string;
  image: string;
  link: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function PrintMediaPage() {
  const [printMedia, setPrintMedia] = useState<PrintMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PrintMediaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    description: '',
  });

  // Fetch print media items
  const fetchPrintMedia = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/printmedia');

      if (response.data.success) {
        setPrintMedia(response.data.data || []);
      } else {
        toast.error('Failed to fetch print media items');
      }
    } catch {
      setPrintMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintMedia();
  }, []);

  const filteredMedia = printMedia.filter(
    item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (item?: PrintMediaItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        image: item.image,
        link: item.link,
        description: item.description,
      });
      setImagePreview(item.image);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        image: '',
        link: '',
        description: '',
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear image URL when file is selected
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.link.trim()) {
      toast.error('Title and link are required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for multipart form submission
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('link', formData.link);
      submitData.append('description', formData.description);

      // Handle image - either file or URL
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      let response;
      if (editingItem) {
        // Update existing item
        response = await axios.put(`/api/printmedia/${editingItem._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new item
        response = await axios.post('/api/printmedia', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast.success(
          editingItem ? 'Print media updated successfully' : 'Print media created successfully'
        );
        setIsDialogOpen(false);
        setEditingItem(null);
        await fetchPrintMedia(); // Refresh the list
      } else {
        toast.error(response.data.message || 'An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this print media item?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/printmedia/${id}`);

      if (response.data.success) {
        toast.success('Print media deleted successfully');
        await fetchPrintMedia(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete print media');
      }
    } catch {
      console.error('Error deleting print media:');
      toast.error('Failed to delete print media');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading print media...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Print Media</h1>
          <p className="text-gray-600">Manage your print media coverage and articles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Media Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Media Item' : 'Add New Media Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="link">Article Link *</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com/article"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the article content"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label>Image</Label>

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="imageFile" className="text-sm text-gray-600">
                      Upload Image File
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isSubmitting}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <Label className="text-sm text-gray-600">Preview</Label>
                      <div className="mt-1 border rounded-lg p-2 relative h-40">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                          unoptimized
                          onError={() => {
                            setImagePreview(null);
                            toast.error('Failed to load image preview');
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingItem ? 'Update' : 'Create'} Media Item</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Media Coverage ({filteredMedia.length} items)
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search media items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No matching media items' : 'No media items'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first media coverage.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map(item => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2" title={item.title}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.createdAt)}
                          </Badge>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        {item.link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
