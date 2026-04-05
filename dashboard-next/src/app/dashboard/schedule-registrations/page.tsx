'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

// Setup localizer for react-big-calendar
import { enUS } from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Type definitions for our data
interface RequestSchedule {
  scheduleId?: string;
  eventDate?: Date;
  eventTime?: string;
  eventLocation?: string;
  eventDetails?: string;
}

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  additionalInfo?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isDeleted: boolean;
  requestedSchedule?: RequestSchedule;
  createdAt: Date;
  updatedAt: Date;
}

// Define the event type for calendar events
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  pendingCount: number;
  resource: string;
}

// Custom calendar event component to show registration count
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div className="flex items-center justify-between p-1">
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium">{event.title}</span>
    </div>
    {event.pendingCount > 0 && <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />}
  </div>
);

export default function Page() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch registrations when component mounts
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/scheduleRegistration');

        if (!response.ok) {

          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch registrations');
        }

        // Transform the data to handle Date objects
        const transformedData = data.data.map(
          (
            reg: Registration & {
              createdAt: string;
              updatedAt: string;
              requestedSchedule?: RequestSchedule & { eventDate?: string };
            }
          ) => ({
            ...reg,
            createdAt: new Date(reg.createdAt),
            updatedAt: new Date(reg.updatedAt),
            requestedSchedule: reg.requestedSchedule
              ? {
                ...reg.requestedSchedule,
                eventDate: reg.requestedSchedule.eventDate
                  ? new Date(reg.requestedSchedule.eventDate)
                  : undefined,
              }
              : undefined,
          })
        );

        setRegistrations(transformedData);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Error loading registrations', {
          description: err instanceof Error ? err.message : 'Failed to load registrations',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Group registrations by date for the calendar view
  const registrationsByDate = useMemo(() => {
    return registrations.reduce<Record<string, Registration[]>>((acc, registration) => {
      if (registration.requestedSchedule?.eventDate) {
        const eventDate = registration.requestedSchedule.eventDate.toISOString().split('T')[0];
        if (!acc[eventDate]) {
          acc[eventDate] = [];
        }
        acc[eventDate].push(registration);
      }
      return acc;
    }, {});
  }, [registrations]);

  // Create events for the big calendar
  const calendarEvents = useMemo(() => {
    return Object.entries(registrationsByDate).map(([dateStr, regs]) => {
      const startDate = new Date(dateStr);
      // Create end date (same day, just for display purposes)
      const endDate = new Date(dateStr);

      const pendingCount = regs.filter(reg => reg.status === 'Pending').length;

      return {
        title: `${regs.length} Registration${regs.length > 1 ? 's' : ''}`,
        start: startDate,
        end: endDate,
        allDay: true,
        pendingCount,
        resource: dateStr, // Store date string for routing
      };
    });
  }, [registrationsByDate]);

  // Handle calendar navigation
  const handleNavigate = (date: Date) => {
    setDate(date);
  };

  // Handle event selection
  const handleSelectEvent = (event: { resource: string }) => {
    const dateString = event.resource; // Get the stored date string
    router.push(`/dashboard/schedule-registrations/${dateString}`);
  };

  // Custom toolbar to match your UI style
  const CustomToolbar = (toolbar: {
    date: Date;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  }) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = toolbar.date;
      return <span className="font-medium">{format(date, 'MMMM yyyy')}</span>;
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div>{label()}</div>
        <div className="flex gap-2">
          <button
            onClick={goToCurrent}
            className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md"
          >
            Today
          </button>
          <button onClick={goToBack} className="px-2 py-1 bg-muted hover:bg-muted/80 rounded-md">
            &lt;
          </button>
          <button onClick={goToNext} className="px-2 py-1 bg-muted hover:bg-muted/80 rounded-md">
            &gt;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-3xl font-semibold">Schedule Registrations</h1>
        <p className="text-muted-foreground">Manage schedule registration requests.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enlarged Calendar Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Select a date to view registration requests</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {loading ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-muted-foreground">Loading registrations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive font-medium mb-2">Error loading data</p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="h-[500px]">
                  <BigCalendar<CalendarEvent>
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    date={date}
                    onNavigate={handleNavigate}
                    components={{
                      event: EventComponent,
                      toolbar: CustomToolbar,
                    }}
                    views={['month']}
                    className="rounded-md border"
                    dayPropGetter={() => ({
                      className: 'text-center',
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Registration Summary Card */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Registration Summary</CardTitle>
            <CardDescription>Overview of registration requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-destructive">Failed to load summary</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Registrations</span>
                  <span className="font-bold">{registrations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    {registrations.filter(reg => reg.status === 'Pending').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approved</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {registrations.filter(reg => reg.status === 'Approved').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rejected</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {registrations.filter(reg => reg.status === 'Rejected').length}
                  </Badge>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Upcoming Registrations</h3>
                  {Object.keys(registrationsByDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming registrations</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(registrationsByDate)
                        .filter(([date]) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Set to midnight to compare dates only
                          // The date string is 'YYYY-MM-DD'. To avoid timezone issues,
                          // we create the date object from its parts.
                          const [year, month, day] = date.split('-').map(Number);
                          const eventDate = new Date(year, month - 1, day);
                          return eventDate >= today;
                        })
                        .sort(
                          ([dateA], [dateB]) =>
                            new Date(dateA).getTime() - new Date(dateB).getTime()
                        )
                        .slice(0, 3)
                        .map(([date, registrations]) => (
                          <div key={date} className="flex items-center justify-between gap-2">
                            <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                            <Badge>{registrations.length} registrations</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
