'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UserEditForm } from '../../user-edit-form';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FamilyMember {
  age: number;
  relation: string;
}

interface UserProfile {
  _id: string;
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
  gender?: 'Male' | 'Female' | 'Other';
  familyMembers?: FamilyMember[];
}

export default function Page() {
  const params = useParams();
  const paramId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/users/${paramId}`);

        // Extract user data from the response
        const data = response.data.data || response.data;

        // Make sure we have the right structure
        if (!data || !data._id) {
          throw new Error('Invalid user data received from API');
        }

        // Format the data to match our UserProfile interface
        const formattedData: UserProfile = {
          _id: data._id,
          fullName: data.profile?.fullName || data.fullName,
          email: data.email,
          contact: data.profile?.contact || data.contact,
          address: data.profile?.address || data.address,
          status: data.status || 'active',
          personalStory: data.profile?.personalStory || data.personalStory,
          profileImage: data.profile?.profileImage || data.profileImage,
          dikshaPlace: data.profile?.dikshaPlace || data.dikshaPlace,
          wishes: data.profile?.wishes || data.wishes,
          maritalStatus: data.profile?.maritalStatus || data.maritalStatus,
          dob: data.profile?.dob || data.dob,
          anniversary: data.profile?.anniversary || data.anniversary,
          swamijiImages: data.profile?.swamijiImages || data.swamijiImages || [],
          gender: data.profile?.gender || data.gender,
          familyMembers: data.profile?.familyMembers || data.familyMembers || [],
        };

        setUserData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [paramId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit User</h1>
        <p className="text-muted-foreground">Update user information and account settings.</p>
      </div>

      {userData && <UserEditForm initialData={userData} />}
    </div>
  );
}
