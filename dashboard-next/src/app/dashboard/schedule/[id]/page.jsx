'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ScheduleForm } from '../schedule-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function EditSchedulePage({ params }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  // Fetch schedule data when component mounts
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/schedule/${id}`);

        if (response.data.success) {
          setSchedule(response.data.data);
        } else {
          setError('Failed to load schedule data');
          toast.error('Error loading schedule', {
            description: response.data.message,
          });
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load schedule. Please try again later.');
        toast.error('Error loading schedule');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSchedule();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="border rounded-md p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-28" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !schedule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Edit Schedule</h1>
          <p className="text-red-500">{error || 'Schedule not found'}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/dashboard/schedule')}
            className="px-4 py-2 border rounded-md hover:bg-muted/50 transition-colors"
          >
            Back to Schedule List
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Transform data for the form component
  const formData = {
    id: schedule._id,
    month: schedule.month,
    locations: schedule.locations,
    // Convert time slots to the format expected by the form
    timeSlots: schedule.timeSlots.map(slot => ({
      period: slot.period,
      // startDate: new Date(slot?.startDate)?.toISOString().slice(0, 16), // Format for datetime-local
      // endDate: new Date(slot?.endDate)?.toISOString().slice(0, 16), // Format for datetime-local
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Schedule</h1>
        <p className="text-muted-foreground">Update the details of this schedule.</p>
      </div>

      <ScheduleForm initialData={formData} />
    </div>
  );
}
