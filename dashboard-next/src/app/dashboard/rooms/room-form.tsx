'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';

interface RoomFormProps {
  initialData?: {
    id?: string;
    name?: string;
    place?: string;
    price?: number;
    date?: string[];
    available?: boolean;
    occupancy?: number;
    email?: string;
    userId?: string;
    isBooked?: boolean;
    images?: string[];
    description?: string;
    amenities?: string[];
  };
}

interface RoomFormData {
  name: string;
  place: string;
  price: number;
  email: string;
  occupancy: number;
  available: boolean;
  isBooked: boolean;
  description?: string;

}

const places = ['Main Ashram', 'Guest House', 'Dormitory Building', 'Meditation Center', 'Other'];
const amenityOptions = [
  'Wi-Fi',
  'Air Conditioning',
  'Private Bathroom',
  'Hot Water',
  'Balcony',
  'Garden View',
  'Temple View',
  'Breakfast Included',
  'Daily Cleaning',
  'Meditation Space',
];

export function RoomForm({ initialData }: RoomFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dates, setDates] = useState<string[]>(initialData?.date || []);
  const [newDate, setNewDate] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenities || []
  );

  // Keep track of new files separately from previews
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // Keep a reference to the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormData>({
    defaultValues: {
      name: initialData?.name || '',
      place: initialData?.place || 'Main Ashram',
      price: initialData?.price || 1000,
      email: initialData?.email || '',
      occupancy: initialData?.occupancy || 1,
      available: initialData?.available ?? true,
      isBooked: initialData?.isBooked ?? false,
      description: initialData?.description || '',
    },
  });

  const addDate = () => {
    if (newDate && !dates.includes(newDate)) {
      setDates(prev => [...prev, newDate]);
      setNewDate('');
    } else if (dates.includes(newDate)) {
      toast.error('Date already added', {
        description: 'This date is already in the list',
      });
    }
  };

  const removeDate = (dateToRemove: string) => {
    setDates(prev => prev.filter(date => date !== dateToRemove));
  };

  const handleDateKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDate();
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log(`handleImagesChange: ${files.length} files selected`);

    // Check total file count (existing previews + new files)
    const existingCount = imagePreviews.filter(
      url => !url.startsWith('data:') || initialData?.images?.includes(url)
    ).length;

    const newCount = files.length;

    if (existingCount + newCount + newImageFiles.length > 5) {
      toast.error('Too many images', {
        description: 'You can only upload a maximum of 5 images per room',
      });
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create arrays to track valid files and their previews
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Process each file
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.includes('image/')) {
        toast.error(`Invalid file type: ${file.name}`, {
          description: 'Only image files are allowed',
        });
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`, {
          description: 'Image size should be under 5MB',
        });
        return;
      }

      // Add to valid files array
      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          const preview = e.target.result.toString();
          newPreviews.push(preview);

          // Only update state when all valid files have been processed
          if (newPreviews.length === validFiles.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            // Store the actual File objects for later upload
            setNewImageFiles(prev => [...prev, ...validFiles]);
            console.log(`Added ${validFiles.length} new files for upload`);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // If no valid files were found, clear the input
    if (validFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImagePreview = (index: number) => {
    // Check if this is a new file or an existing one
    const previewUrl = imagePreviews[index];
    const isNewFile = previewUrl.startsWith('data:');

    // Remove from imagePreviews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));

    // If it's a new file, also remove from newImageFiles
    if (isNewFile) {
      // Find the corresponding file in newImageFiles
      const fileIndex = newImageFiles.findIndex((_, i) => {
        // This is a simplistic approach - in a real app, you might
        // want to store a mapping between previews and files
        return i === index - (imagePreviews.length - newImageFiles.length);
      });

      if (fileIndex !== -1) {
        setNewImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(item => item !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const onSubmit: SubmitHandler<RoomFormData> = async data => {
    try {
      if (dates.length === 0) {
        toast.error('Missing dates', {
          description: 'Please add at least one date for the room availability',
        });
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('place', data.place);
      formData.append('price', data.price.toString());
      formData.append('email', data.email);
      formData.append('occupancy', data.occupancy.toString());
      formData.append('available', data.available.toString());
      formData.append('isBooked', data.isBooked.toString());
      if (data.description) {
        formData.append('description', data.description);
      }

      // Add dates
      dates.forEach((date, index) => {
        formData.append(`date[${index}]`, date);
      });

      // Add amenities
      selectedAmenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}]`, amenity);
      });

      // Add existing images that should be kept
      const existingImages = initialData?.images || [];
      const keptImages = existingImages.filter(img => imagePreviews.includes(img));

      keptImages.forEach((img, index) => {
        formData.append(`existingImages[${index}]`, img);
      });

      // Add new image files directly from our state
      console.log(`Uploading ${newImageFiles.length} new images`);
      newImageFiles.forEach((file, index) => {
        console.log(`Adding file ${index + 1}: ${file.name} (${file.size} bytes)`);
        formData.append('images', file);
      });

      // Log all entries being sent in FormData for debugging
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      let response;

      if (initialData?.id) {
        response = await axios.put(`/api/roombooking/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Room updated:', response.data);
      } else {
        response = await axios.post('/api/roombooking', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds timeout
        });
        console.log('Room created:', response.data);
      }

      toast.success(initialData?.id ? 'Room updated successfully' : 'Room created successfully', {
        description: 'Success',
      });

      router.push('/dashboard/rooms');
    } catch (error) {
      console.error('Error submitting room:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request error details:', error.response?.data);
      }
      toast.error('There was a problem saving the room. Please try again.', {
        description: 'Error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBookedValue = watch('isBooked');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Room name is required' })}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="place">Place</Label>
              <Select value={watch('place')} onValueChange={value => setValue('place', value)}>
                <SelectTrigger id="place">
                  <SelectValue placeholder="Select place" />
                </SelectTrigger>
                <SelectContent>
                  {places.map(place => (
                    <SelectItem key={place} value={place}>
                      {place}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.place && <p className="text-sm text-red-500">{errors.place.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                    valueAsNumber: true,
                  })}
                  aria-invalid={errors.price ? 'true' : 'false'}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="occupancy">Occupancy</Label>
                <Input
                  id="occupancy"
                  type="number"
                  min="1"
                  {...register('occupancy', {
                    required: 'Occupancy is required',
                    min: { value: 1, message: 'Occupancy must be at least 1' },
                    valueAsNumber: true,
                  })}
                  aria-invalid={errors.occupancy ? 'true' : 'false'}
                />
                {errors.occupancy && (
                  <p className="text-sm text-red-500">{errors.occupancy.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Please enter a valid email address',
                  },
                })}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-3">
              <Label>Available Dates</Label>
              <div className="flex gap-2">
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  onKeyPress={handleDateKeyPress}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Button type="button" onClick={addDate} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {dates.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {dates.map(date => (
                    <Badge key={date} variant="secondary" className="flex items-center gap-1">
                      {new Date(date).toLocaleDateString()}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => removeDate(date)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  No dates added yet. Please add at least one date.
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Room Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the room and its features..."
                {...register('description')}
                rows={4}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="roomImages">Room Images (Max 5)</Label>
              <Input
                id="roomImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                ref={fileInputRef}
              />
              <p className="text-xs text-muted-foreground">
                Select up to 5 images to showcase the room. Maximum size: 5MB per image.
              </p>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 w-full">
                        <Image
                          src={src}
                          alt={`Room preview ${index + 1}`}
                          className="rounded-md border object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, 160px"
                          onError={() => removeImagePreview(index)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreviews.length === 0 && (
                <div className="flex items-center justify-center border border-dashed rounded-md p-8 text-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="mb-2 h-8 w-8" />
                    <p>No images added yet</p>
                    <p className="text-xs mt-1">Images help guests see what the room looks like</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label>Room Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {amenityOptions.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="available"
                  checked={watch('available')}
                  onCheckedChange={checked => setValue('available', checked)}
                  disabled={isBookedValue}
                />
                <Label htmlFor="available" className={isBookedValue ? 'opacity-50' : ''}>
                  Available for Booking
                  {isBookedValue && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Disabled when booked)
                    </span>
                  )}
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="isBooked"
                  checked={watch('isBooked')}
                  onCheckedChange={checked => {
                    setValue('isBooked', checked);
                    if (checked) {
                      setValue('available', false);
                    }
                  }}
                />
                <Label htmlFor="isBooked">Currently Booked</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/rooms')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Room' : 'Add Room'}
        </Button>
      </div>
    </form>
  );
}
