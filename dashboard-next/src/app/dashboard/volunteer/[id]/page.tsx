'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  Briefcase,
  Loader2,
  FileText,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import Image from 'next/image';

// Define volunteer interface
interface Volunteer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  maritalStatus?: string;
  gender?: string;
  highestEducation?: string;
  hoursAvailable?: {
    hours: number;
    period: 'day' | 'week' | 'month';
  };
  age: number;
  occupationType?: string;
  occupation: string;
  availability: string[];
  availableFrom?: string | Date;
  availableUntil?: string | Date;
  skills: string[];
  profile?: string;
  motivation: string;
  experience?: string;
  consent: boolean;
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function Page() {
  const params = useParams();
  const paramId = params.id as string;

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Use useCallback to memoize the fetchVolunteerData function
  const fetchVolunteerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/volunteer/${paramId}`);

      if (response.data.success && response.data.data) {
        // Parse dates
        const volunteerData = response.data.data;
        setVolunteer({
          ...volunteerData,
          createdAt: new Date(volunteerData.createdAt),
          updatedAt: new Date(volunteerData.updatedAt),
          availableFrom: volunteerData.availableFrom
            ? new Date(volunteerData.availableFrom)
            : undefined,
          availableUntil: volunteerData.availableUntil
            ? new Date(volunteerData.availableUntil)
            : undefined,
        });
      } else {
        setError('Failed to load volunteer data');
        toast.error('Failed to load volunteer data');
      }
    } catch (err) {
      console.error('Error fetching volunteer:', err);

      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        toast.error('Error loading volunteer', {
          description: errorMsg,
        });
      } else {
        setError('An unknown error occurred');
        toast.error('Error loading volunteer');
      }
    } finally {
      setLoading(false);
    }
  }, [paramId]); // Add paramId as dependency for useCallback

  // Now we can safely add fetchVolunteerData as a dependency
  useEffect(() => {
    fetchVolunteerData();
  }, [fetchVolunteerData]);

  const toggleApproval = async () => {
    if (!volunteer) return;

    try {
      setUpdating(true);
      const response = await axios.put(`/api/volunteer/${paramId}`, {
        isApproved: !volunteer.isApproved,
      });

      if (response.data.success) {
        setVolunteer({
          ...volunteer,
          isApproved: !volunteer.isApproved,
        });

        toast.success(
          `Volunteer ${!volunteer.isApproved ? 'approved' : 'approval revoked'} successfully`
        );
      } else {
        throw new Error(response.data.message || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Error updating approval status:', err);

      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        toast.error('Failed to update approval status', {
          description: errorMsg,
        });
      } else {
        toast.error('Failed to update approval status', {
          description: err instanceof Error ? err.message : 'An unknown error occurred',
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadProfile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading volunteer data...</p>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/volunteer">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to volunteers</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error || 'Failed to load volunteer data'}
            </div>
            <div className="mt-4">
              <Button onClick={fetchVolunteerData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/volunteer">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to volunteers</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Volunteer Profile</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {volunteer.isApproved ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              Approved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
              Pending Approval
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Applied on {formatDate(volunteer.createdAt as Date)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={volunteer.isApproved ? 'destructive' : 'default'}
            onClick={toggleApproval}
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : volunteer.isApproved ? (
              'Revoke Approval'
            ) : (
              'Approve Volunteer'
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {volunteer.profile && (
              <div className="space-y-2">
                <div className="font-medium">Profile Document/Image</div>
                {volunteer.profile.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild className="flex-1">
                        <a
                          href={volunteer.profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() =>
                          downloadProfile(volunteer.profile!, `${volunteer.fullName}-profile.pdf`)
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={volunteer.profile}
                        alt={`${volunteer.fullName}'s profile`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() =>
                        downloadProfile(
                          volunteer.profile!,
                          `${volunteer.fullName}-profile.${volunteer.profile!.split('.').pop()}`
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{volunteer.fullName}</div>
                  <div className="text-sm text-muted-foreground">{volunteer.age} years old</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{volunteer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{volunteer.phone}</span>
              </div>
              {volunteer.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{volunteer.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div>{volunteer.occupation}</div>
                  {volunteer.occupationType && (
                    <div className="text-sm text-muted-foreground capitalize">
                      {volunteer.occupationType}
                    </div>
                  )}
                </div>
              </div>
              {volunteer.gender && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="capitalize">{volunteer.gender}</span>
                </div>
              )}
              {volunteer.maritalStatus && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="capitalize">{volunteer.maritalStatus}</span>
                </div>
              )}
              {volunteer.highestEducation && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>{volunteer.highestEducation}</span>
                </div>
              )}
              {volunteer.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{`${volunteer.city}, ${volunteer.state || ''} ${volunteer.zip || ''}`}</span>
                </div>
              )}
              {volunteer.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{volunteer.country}</span>
                </div>
              )}
              {volunteer.hoursAvailable && volunteer.hoursAvailable.hours > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="capitalize">
                    {volunteer.hoursAvailable.hours} hours / {volunteer.hoursAvailable.period} available
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Volunteer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map(skill => (
                  <Badge key={skill} className="capitalize">
                    {skill.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Availability</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {volunteer.availability.map(day => (
                    <Badge key={day} variant="outline" className="capitalize">
                      {day.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                {volunteer.availableFrom && volunteer.availableUntil && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(volunteer.availableFrom as Date)} -{' '}
                      {formatDate(volunteer.availableUntil as Date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Motivation</h3>
              <p className="text-muted-foreground">{volunteer.motivation}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              <p className="text-muted-foreground">
                {volunteer.experience || 'No experience provided'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Consent</h3>
              <p className="text-muted-foreground">
                {volunteer.consent
                  ? 'Volunteer has provided consent for data processing and communication.'
                  : 'Volunteer has not provided consent.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
