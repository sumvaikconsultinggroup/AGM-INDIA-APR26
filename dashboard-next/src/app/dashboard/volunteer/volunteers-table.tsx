'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios'; // Import axios
import { Trash, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Define type for volunteer data
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
  age: number;
  occupationType?: string;
  occupation: string;
  availability: string[];
  availableFrom?: string | Date;
  availableUntil?: string | Date;
  skills: string[];
  motivation: string;
  experience?: string;
  consent: boolean;
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function VolunteersTable() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  // Fetch volunteers data when component mounts
  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Using axios instead of fetch
      const response = await axios.get('/api/volunteer');

      const data = response.data;

      if (data.success && data.data) {
        // Parse dates for proper formatting
        const parsedData = data.data.map((volunteer: Volunteer) => ({
          ...volunteer,
          createdAt: new Date(volunteer.createdAt),
          updatedAt: new Date(volunteer.updatedAt),
          availableFrom: volunteer.availableFrom ? new Date(volunteer.availableFrom) : undefined,
          availableUntil: volunteer.availableUntil ? new Date(volunteer.availableUntil) : undefined,
        }));

        setVolunteers(parsedData);
      } else {
        setVolunteers([]);
        setError(data.message || 'No volunteers found');
      }
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      // Handle axios errors
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        toast.error('Failed to load volunteers', {
          description: errorMsg,
        });
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to load volunteers', {
          description: 'An unknown error occurred',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setVolunteerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!volunteerToDelete) return;

    try {
      // Using axios instead of fetch
      const response = await axios.delete(`/api/volunteer/${volunteerToDelete}`);

      const result = response.data;

      if (result.success) {
        // Remove the deleted volunteer from state
        setVolunteers(volunteers.filter(volunteer => volunteer._id !== volunteerToDelete));

        toast.success('Volunteer deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete volunteer');
      }
    } catch (err) {
      console.error('Error deleting volunteer:', err);

      // Handle axios errors
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        toast.error('Failed to delete volunteer', {
          description: errorMsg,
        });
      } else {
        toast.error('Failed to delete volunteer', {
          description: err instanceof Error ? err.message : 'An unknown error occurred',
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      // Using axios instead of fetch
      const response = await axios.put(`/api/volunteer/${id}`, {
        isApproved: !currentStatus,
      });

      const result = response.data;

      if (result.success) {
        // Update the volunteer in state
        setVolunteers(
          volunteers.map(volunteer =>
            volunteer._id === id ? { ...volunteer, isApproved: !currentStatus } : volunteer
          )
        );

        toast.success(`Volunteer ${!currentStatus ? 'approved' : 'approval revoked'} successfully`);
      } else {
        throw new Error(result.message || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Error updating approval status:', err);

      // Handle axios errors
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
    }
  };

  // Filter volunteers based on selected filters
  const filteredVolunteers = volunteers.filter(volunteer => {
    return (
      approvalFilter === 'all' ||
      (approvalFilter === 'approved' && volunteer.isApproved) ||
      (approvalFilter === 'pending' && !volunteer.isApproved)
    );
  });

  console.log(filteredVolunteers)
  

  // Format date to a more readable format
  // const formatDate = (date: Date) => {
  //   return date.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   });
  // };

  // Rest of your render method remains the same
  return (
    <>
      <div className="flex justify-between mb-4">
        <Button onClick={fetchVolunteers} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>

        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Volunteers</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading volunteers...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
      ) : volunteers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No volunteers found. New applications will appear here.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            {/* Table content remains the same */}
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.map(volunteer => (
                <TableRow key={volunteer._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{volunteer.fullName}</div>
                      <div className="text-xs text-muted-foreground">{volunteer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {[volunteer.city, volunteer.state].filter(Boolean).join(', ') || volunteer.location}
                  </TableCell>
                  <TableCell>{volunteer.occupation}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.availability.map(day => (
                        <Badge key={day} variant="outline" className="capitalize">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {volunteer.isApproved ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-50"
                      >
                        Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                      >
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/volunteer/${volunteer._id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleApproval(volunteer._id, volunteer.isApproved)}
                      >
                        {volunteer.isApproved ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="sr-only">
                          {volunteer.isApproved ? 'Revoke Approval' : 'Approve'}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(volunteer._id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this volunteer from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
