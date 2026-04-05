'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { RoomForm } from '../room-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BedDouble } from 'lucide-react';

export default function EditRoomPage({ params }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/roombooking/${params.id}`);
        if (response.data.success) {
          setRoom(response.data.data);
        } else {
          setError('Failed to load room data');
          toast.error('Error loading room', {
            description: response.data.message,
          });
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        setError('Failed to load room. Please try again later.');
        toast.error('Error loading room');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRoom();
    }
  }, [params.id]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="border rounded-md p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Edit Room</h1>
            <p className="text-red-500">{error || 'Room not found'}</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/rooms')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Button>
        </div>
        <div className="flex items-center justify-center p-8 text-center border rounded-md bg-muted/10">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-muted p-3">
              <BedDouble className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Unable to load room</h3>
            <p className="text-sm text-muted-foreground">
              There was an issue loading this room. Please try again or select another room.
            </p>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => window.location.reload()} size="sm">
                Try Again
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/rooms">View All Rooms</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for the form component
  const formData = {
    id: room._id,
    name: room.name,
    place: room.place,
    price: room.price,
    date: room.date,
    available: room.available,
    occupancy: room.occupancy,
    email: room.email,
    userId: room.userId,
    isBooked: room.isBooked,
    description: room.description || '', // Include description with fallback to empty string
    amenities: room.amenities || [], // Include amenities with fallback to empty array
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Edit Room</h1>
          <p className="text-muted-foreground">Update the details of this room.</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/rooms')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Button>
      </div>

      <RoomForm initialData={formData} />
    </div>
  );
}
