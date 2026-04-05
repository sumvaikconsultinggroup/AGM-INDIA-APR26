'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Loader2,
  User,
  Lock,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

// Define user interface for the updated user model
interface FamilyMember {
  age: number;
  relation: string;
}

interface UserProfile {
  profileImage?: string;
  fullName?: string;
  age?: number;
  contact?: string;
  dikshaPlace?: string;
  address?: string;
  wishes?: string;
  personalStory?: string;
  maritalStatus?: 'Married' | 'Unmarried';
  dob?: string | Date;
  anniversary?: string | Date | null;
  swamijiImages?: string[];
  gender?: 'Male' | 'Female' | 'Other';
  familyMembers?: FamilyMember[];
}

interface User {
  _id?: string;
  uid?: string; // For OAuth users
  username?: string;
  name?: string; // For OAuth users
  email: string;
  picture?: string; // For OAuth users
  isOTPVerified?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  authMethod: 'normal' | 'oauth'; // Added authMethod field
  role?: 'user' | 'admin' | 'editor' | 'moderator';
  profile?: UserProfile;
  registeredEvents?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  provider?: string; // OAuth provider (google, facebook, etc.)
}

export default function Page() {
  const params = useParams();
  const paramId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${paramId}`);

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setUser({
          ...userData,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
          updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          profile: userData.profile
            ? {
                ...userData.profile,
                dob: userData.profile.dob ? new Date(userData.profile.dob) : undefined,
                anniversary: userData.profile.anniversary
                  ? new Date(userData.profile.anniversary)
                  : null,
              }
            : undefined,
        });
      } else {
        setError('Failed to load user data');
        toast.error('Failed to load user data');
      }
    } catch (err) {
      console.error('Error fetching user:', err);

      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        toast.error('Error loading user', {
          description: errorMsg,
        });
      } else {
        setError('An unknown error occurred');
        toast.error('Error loading user');
      }
    } finally {
      setLoading(false);
    }
  }, [paramId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const toggleStatus = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      const newStatus = user.status === 'active' ? 'suspended' : 'active';

      // Use the correct ID (_id or uid) based on auth method
      const userId = user.authMethod === 'oauth' ? user.uid : user._id;
      const response = await axios.put(`/api/users/${userId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        setUser({
          ...user,
          status: newStatus,
        });

        toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);

      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        toast.error('Failed to update user status', {
          description: errorMsg,
        });
      } else {
        toast.error('Failed to update user status', {
          description: err instanceof Error ? err.message : 'An unknown error occurred',
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to users</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error || 'Failed to load user data'}
            </div>
            <div className="mt-4">
              <Button onClick={fetchUserData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Choose the appropriate user display name based on auth method
  const userName =
    user.authMethod === 'oauth'
      ? user.name || user.profile?.fullName || 'Unknown User'
      : user.profile?.fullName || user.username || 'Unknown User';

  const userEmail = user.email;
  const userPhone = user.profile?.contact || 'Not provided';
  const userAddress = user.profile?.address || 'Not provided';

  // Use the appropriate profile image based on auth method
  const profileImage =
    user.authMethod === 'oauth'
      ? user.picture || user.profile?.profileImage || '/placeholder.svg'
      : user.profile?.profileImage || '/placeholder.svg';

  // Get the user ID based on auth method
  const userId = user.authMethod === 'oauth' ? user.uid : user._id;

  // Format OAuth provider for display
  const formatProvider = (provider?: string) => {
    if (!provider) return 'Unknown';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to users</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">User Profile</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {user.status === 'active' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
              Suspended
            </Badge>
          )}

          {/* Add badge for auth method */}
          {user.authMethod === 'normal' ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              <Lock className="h-3 w-3 mr-1" />
              Password Login
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
              <Globe className="h-3 w-3 mr-1" />
              {user.provider ? `${formatProvider(user.provider)} OAuth` : 'OAuth'}
            </Badge>
          )}

          {/* Add badge for role */}
          {user.role && (
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={user.status === 'active' ? 'destructive' : 'default'}
            onClick={toggleStatus}
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : user.status === 'active' ? (
              'Suspend User'
            ) : (
              'Activate User'
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/users/${userId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                <Image
                  src={profileImage}
                  alt={userName}
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                />
              </div>
              <h2 className="text-2xl font-bold">{userName}</h2>
              {user.profile?.age && (
                <p className="text-muted-foreground">Age: {user.profile.age}</p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{userPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{userAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Registered on</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Last active</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <dl className="mt-2 divide-y divide-border">
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">User ID</dt>
                      <dd className="font-mono text-sm">
                        {user.authMethod === 'oauth' ? user.uid : user._id}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Authentication Type</dt>
                      <dd>
                        {user.authMethod === 'normal' ? (
                          <span className="flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            Password
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            {formatProvider(user.provider)} OAuth
                          </span>
                        )}
                      </dd>
                    </div>
                    {user.authMethod === 'normal' && user.username && (
                      <div className="flex justify-between py-2">
                        <dt className="text-muted-foreground">Username</dt>
                        <dd>{user.username}</dd>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd>{user.email}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="capitalize">{user.role || 'user'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Registration Date</dt>
                      <dd>{formatDate(user.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        {user.status === 'active' ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-50"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-50"
                          >
                            Suspended
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <dl className="mt-2 divide-y divide-border">
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Full Name</dt>
                      <dd>{user.profile?.fullName || user.name || 'Not provided'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Date of Birth</dt>
                      <dd>{user.profile?.dob ? formatDate(user.profile.dob) : 'Not provided'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Marital Status</dt>
                      <dd>{user.profile?.maritalStatus || 'Not provided'}</dd>
                    </div>
                    {user.profile?.maritalStatus === 'Married' && (
                      <div className="flex justify-between py-2">
                        <dt className="text-muted-foreground">Anniversary Date</dt>
                        <dd>
                          {user.profile?.anniversary
                            ? formatDate(user.profile.anniversary)
                            : 'Not provided'}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Gender</dt>
                      <dd>{user.profile?.gender || 'Not provided'}</dd>
                    </div>

                    {user.profile?.familyMembers && user.profile.familyMembers.length > 0 && (
                      <div className="py-2">
                        <dt className="text-muted-foreground mb-2">Family Members</dt>
                        <dd>
                          <div className="space-y-2">
                            {user.profile.familyMembers.map((member, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                              >
                                <span>{member.relation}</span>
                                <Badge variant="secondary">Age: {member.age}</Badge>
                              </div>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Diksha & Wishes */}
                <div>
                  <h3 className="text-lg font-medium">Spiritual Journey</h3>
                  <dl className="mt-2 divide-y divide-border">
                    <div className="flex justify-between py-2">
                      <dt className="text-muted-foreground">Diksha Place</dt>
                      <dd>{user.profile?.dikshaPlace || 'Not provided'}</dd>
                    </div>
                    {user.profile?.wishes && (
                      <div className="py-2">
                        <dt className="text-muted-foreground mb-1">Wishes</dt>
                        <dd className="whitespace-pre-wrap">{user.profile.wishes}</dd>
                      </div>
                    )}
                    {user.profile?.personalStory && (
                      <div className="py-2">
                        <dt className="text-muted-foreground mb-1">Personal Story</dt>
                        <dd className="whitespace-pre-wrap">{user.profile.personalStory}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Swamiji Images */}
                {user.profile?.swamijiImages && user.profile.swamijiImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Swamiji Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {user.profile.swamijiImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-md overflow-hidden border"
                        >
                          <Image
                            src={img}
                            alt={`Swamiji image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
