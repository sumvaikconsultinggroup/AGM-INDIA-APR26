'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Edit, MoreHorizontal, Ban, UserCheck, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Define user interface based on your data structure
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
}

interface User {
  _id: string;
  username: string;
  email: string;
  isOTPVerified: boolean;
  status?: 'active' | 'suspended';
  profile?: UserProfile;
  registeredEvents?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch users data when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/users');
      const data = response.data;

      if (data.success && data.data) {
        // Parse dates if needed
        const parsedData = data.data.map((user: User) => ({
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
          profile: user.profile
            ? {
                ...user.profile,
                dob: user.profile.dob ? new Date(user.profile.dob) : undefined,
                anniversary: user.profile.anniversary ? new Date(user.profile.anniversary) : null,
              }
            : undefined,
          // If no status is provided, default to active
          status: user.status || 'active',
        }));

        setUsers(parsedData);
      } else {
        setUsers([]);
        setError(data.message || 'No users found');
      }
    } catch (err) {
      console.error('Error fetching users:', err);

      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        toast.error('Failed to load users', {
          description: errorMsg,
        });
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to load users', {
          description: 'An unknown error occurred',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      // Toggle between active and suspended only
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

      const response = await axios.put(`/api/users/${id}`, {
        status: newStatus,
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;
      console.log('Update result:', result);

      if (result.success) {
        // Update the user in state
        setUsers(users.map(user => (user._id === id ? { ...user, status: newStatus } : user)));

        toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      } else {
        throw new Error(result.message || 'Failed to update user status');
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
    }
  };

  // Filter users based on selected filter
  const filteredUsers = users.filter(user => {
    return statusFilter === 'all' || user.status === statusFilter;
  });

  return (
    <>
      <div className="flex justify-between mb-4">
        <Button onClick={fetchUsers} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No users found. New registrations will appear here.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    {user.profile?.fullName || user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-50"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => toggleStatus(user._id, 'active')}>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => toggleStatus(user._id, 'suspended')}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
