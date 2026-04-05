'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';

interface UserEditFormProps {
  initialData?: {
    _id?: string;
    fullName?: string;
    email?: string;
    contact?: string;
    address?: string;
    status?: 'active' | 'suspended';
    personalStory?: string;
    profileImage?: string;
    dikshaPlace?: string;
    wishes?: string;
    maritalStatus?: 'Married' | 'Unmarried';
    dob?: string | Date;
    anniversary?: string | Date | null;
    swamijiImages?: string[];
  };
}

const statuses = ['active', 'suspended'];
const maritalStatuses = ['Married', 'Unmarried'];

export function UserEditForm({ initialData }: UserEditFormProps) {
  const router = useRouter();

  // Convert string dates to Date objects if they exist
  const convertToDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return undefined;
    return dateString instanceof Date ? dateString : new Date(dateString);
  };

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    contact: initialData?.contact || '',
    address: initialData?.address || '',
    status: initialData?.status || 'active',
    personalStory: initialData?.personalStory || '',
    dikshaPlace: initialData?.dikshaPlace || '',
    wishes: initialData?.wishes || '',
    maritalStatus: initialData?.maritalStatus || 'Unmarried',
    dob: convertToDate(initialData?.dob),
    anniversary: convertToDate(initialData?.anniversary),
    password: '',
    confirmPassword: '',
  });

  // File related states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    initialData?.profileImage || ''
  );
  const [swamijiImages, setSwamijiImages] = useState<File[]>([]);
  const [swamijiImagePreviews, setSwamijiImagePreviews] = useState<string[]>(
    initialData?.swamijiImages || []
  );

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const swamijiImagesInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setProfileImagePreview(fileUrl);
    }
  };

  const handleSwamijiImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSwamijiImages(prev => [...prev, ...newFiles]);

      // Create preview URLs for all new files
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setSwamijiImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveSwamijiImage = (index: number) => {
    setSwamijiImagePreviews(prev => prev.filter((_, i) => i !== index));

    // If this is a new file (not from the server), also remove from files array
    if (index < swamijiImages.length) {
      setSwamijiImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate password match if creating a new user
    if (!initialData?._id && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'dob' || key === 'anniversary') {
            if (value) {
              formDataToSend.append(key, value.toString());
            }
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      // Add profile image if available
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      } else if (profileImagePreview && profileImagePreview.startsWith('http')) {
        // Keep existing URL if not changed
        formDataToSend.append('profileImageUrl', profileImagePreview);
      }

      // Add Swamiji images if available
      swamijiImages.forEach(file => {
        formDataToSend.append('swamijiImages', file);
      });

      // Keep existing URLs for Swamiji images that weren't removed
      swamijiImagePreviews
        .filter(url => url.startsWith('http'))
        .forEach(url => {
          formDataToSend.append('swamijiImageUrls', url);
        });

      // Make API call to update or create user
      const response = await axios({
        method: initialData?._id ? 'PUT' : 'POST',
        url: initialData?._id ? `/api/users/${initialData._id}` : '/api/users',
        data: formDataToSend,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success(initialData?._id ? 'User updated successfully' : 'User created successfully');

        // Navigate back to users list or to the new user's profile
        if (initialData?._id) {
          router.push(`/dashboard/users/${initialData._id}`);
        } else if (response.data.data?._id) {
          router.push(`/dashboard/users/${response.data.data._id}`);
        } else {
          router.push('/dashboard/users');
        }

        router.refresh();
      } else {
        throw new Error(
          response.data.message || `Failed to ${initialData?._id ? 'update' : 'create'} user`
        );
      }
    } catch (error) {
      console.error('Error saving user:', error);

      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || error.message;
        toast.error(`Failed to ${initialData?._id ? 'update' : 'create'} user`, {
          description: errorMsg,
        });
      } else {
        toast.error(`Failed to ${initialData?._id ? 'update' : 'create'} user`, {
          description: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Basic Info</TabsTrigger>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="profileImage">Profile Image</Label>
                  <div className="flex items-center gap-4">
                    {profileImagePreview ? (
                      <div className="relative h-32 w-32 rounded-full overflow-hidden border">
                        <Image
                          src={profileImagePreview}
                          alt="Profile preview"
                          fill
                          sizes="128px"
                          className="object-cover"
                          onError={() => {
                            toast.error('Failed to load image preview');
                            setProfileImagePreview('');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full border flex items-center justify-center bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Input
                        ref={profileImageInputRef}
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => profileImageInputRef.current?.click()}
                      >
                        {profileImagePreview ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {profileImagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          className="text-destructive border-destructive"
                          onClick={() => {
                            setProfileImage(null);
                            setProfileImagePreview('');
                          }}
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="personalStory">Personal Story</Label>
                  <Textarea
                    id="personalStory"
                    name="personalStory"
                    value={formData.personalStory}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="dikshaPlace">Diksha Place</Label>
                  <Input
                    id="dikshaPlace"
                    name="dikshaPlace"
                    value={formData.dikshaPlace}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="wishes">Wishes</Label>
                  <Textarea
                    id="wishes"
                    name="wishes"
                    value={formData.wishes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={value => handleSelectChange('maritalStatus', value)}
                  >
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.dob && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dob ? format(formData.dob, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dob}
                        onSelect={date => handleDateChange('dob', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {formData.maritalStatus === 'Married' && (
                  <div className="grid gap-3">
                    <Label>Anniversary Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formData.anniversary && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.anniversary ? (
                            format(formData.anniversary, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.anniversary || undefined}
                          onSelect={date => handleDateChange('anniversary', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Swamiji Images Section */}
                <div className="grid gap-3">
                  <Label>Swamiji Images</Label>

                  <div className="flex gap-2">
                    <Input
                      ref={swamijiImagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSwamijiImagesChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => swamijiImagesInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload Swamiji Images
                    </Button>
                  </div>

                  {swamijiImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {swamijiImagePreviews.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-md overflow-hidden border">
                            <Image
                              src={img}
                              alt={`Swamiji image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover"
                              onError={() => {
                                toast.error(`Failed to load image ${index + 1}`);
                                handleRemoveSwamijiImage(index);
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveSwamijiImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status === 'active' ? 'Active' : 'Suspended'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!initialData?._id ? (
                  <>
                    <div className="grid gap-3">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!initialData?._id}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={!initialData?._id}
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid gap-3">
                    <Button type="button" variant="outline">
                      Reset Password
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              initialData?._id ? `/dashboard/users/${initialData._id}` : '/dashboard/users'
            )
          }
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData?._id ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
