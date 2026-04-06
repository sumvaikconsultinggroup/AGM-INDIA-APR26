'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Download,
  Rows,
  LayoutGrid,
} from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import jsPDF from 'jspdf'; // or import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// API Functions
const fetchEventsByDate = async date => {
  const res = await fetch(`/api/daily-events?date=${date}`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events || [];
};

const fetchAllEvents = async () => {
  // Fetch events for a wide range to cover navigation.
  const start = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
  const end = moment().add(4, 'months').endOf('month').format('YYYY-MM-DD');
  const res = await fetch(`/api/daily-events?startDate=${start}&endDate=${end}`);
  if (!res.ok) {
    console.error('Failed to fetch all events');
    return [];
  }
  const data = await res.json();
  return data.events || [];
};

// Helper function to convert 24h to 12h format
function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function DailySchedulePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isImportingPoster, setIsImportingPoster] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAllEvents();
  }, []);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      const events = await fetchAllEvents();
      setAllEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load events for selected date
  useEffect(() => {
    const loadSelectedDateEvents = async () => {
      if (!mounted) return;

      const selectedKey = formatDate(selected, 'yyyy-MM-dd');
      try {
        const events = await fetchEventsByDate(selectedKey);
        setSelectedDateEvents(events);
      } catch (error) {
        console.error('Error loading selected date events:', error);
        setSelectedDateEvents([]);
      }
    };

    loadSelectedDateEvents();
  }, [selected, mounted]);

  const selectedKey = formatDate(selected, 'yyyy-MM-dd');
  const todaysList = useMemo(() => selectedDateEvents, [selectedDateEvents]);

  const events = useMemo(() => {
    if (!mounted || loading) return [];

    return allEvents
      .filter(item => !item.isHidden)
      .map(item => {
        // Correctly parse the date string to avoid timezone issues.
        const [year, month, day] = item.date.split('-').map(Number);
        const [startHour, startMin] = item.time.split(':').map(Number);
        // new Date(Y, M-1, D) is interpreted in the local timezone.
        const start = new Date(year, month - 1, day, startHour, startMin);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        return {
          id: item._id,
          title: item.title,
          start,
          end,
          resource: item,
        };
      });
  }, [mounted, loading, allEvents]);

  const handleSelectEvent = event => {
    router.push(`/dashboard/daily-schedule/${formatDate(event.start, 'yyyy-MM-dd')}`);
  };

  const handleSelectSlot = ({ start }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(start);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return;

    setIsNavigating(true);
    setSelected(start);
    router.push(`/dashboard/daily-schedule/${formatDate(start, 'yyyy-MM-dd')}`);
  };

  const handleNavigate = direction => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() - 1);
      else if (view === Views.WEEK) newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
    } else {
      if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() + 1);
      else if (view === Views.WEEK) newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    if (view === Views.MONTH) return formatDate(currentDate, 'MMMM yyyy');
    if (view === Views.WEEK) {
      const start = moment(currentDate).startOf('week');
      const end = moment(currentDate).endOf('week');
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    }
    return formatDate(currentDate, 'MMMM d, yyyy');
  };

  const dayPropGetter = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate < today) {
      return {
        style: {
          backgroundColor: 'hsl(var(--muted) / 0.3)',
          color: 'hsl(var(--muted-foreground) / 0.5)',
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
      };
    }
    return {};
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait' });
    const tableColumn = ['Title', 'Description', 'Time', 'Date', 'Location'];

    // 1. Filter non-hidden events and sort by date and time
    const allFilteredEvents = allEvents
      .filter(event => !event.isHidden)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

    // 2. Add document title
    doc.setFontSize(18);
    doc.text('All Schedules', 14, 20);
    doc.setFontSize(12);

    // 3. Create table rows
    const tableRows = allFilteredEvents.map(item => {
      const formattedTime = formatTimeTo12Hour(item.time);
      return [
        item.title,
        item.description || '-',
        formattedTime === '12:00 AM' ? 'N/A' : formattedTime,
        formatDate(new Date(item.date.replace(/-/g, '/')), 'PPP'),
        item.location,
      ];
    });

    // 4. Create the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [22, 101, 52] }, // Dark green for header
    });

    doc.save(`all-schedules.pdf`);
  };

  const handleImportLatestPoster = async () => {
    try {
      setIsImportingPoster(true);
      const confirmed = window.confirm(
        'This will replace the current schedule database with the poster dataset. Continue only if you want to overwrite the live schedule.'
      );

      if (!confirmed) {
        return;
      }

      const response = await fetch('/api/schedule/import-latest?replace=1', { method: 'POST' });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Import failed');
      }

      alert('Latest official poster schedule imported successfully.');
    } catch (error) {
      console.error('Failed to import latest poster schedule:', error);
      alert('Unable to import the latest poster schedule right now.');
    } finally {
      setIsImportingPoster(false);
    }
  };

  if (!mounted || loading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="relative space-y-4 md:space-y-6 md:p-0">
      {isNavigating && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading date...</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">Daily Schedule</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your schedules. Past dates cannot be selected.
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleImportLatestPoster}
              className="w-full sm:w-auto"
              disabled={isImportingPoster}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>{isImportingPoster ? 'Replacing...' : 'Replace With Poster'}</span>
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Export PDF</span>
              <span className="xs:hidden">Export</span>
            </Button>
            <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Add Schedule</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ShadcnCalendar
                  mode="single"
                  selected={selected}
                  onSelect={date => {
                    if (date) {
                      const formattedDate = formatDate(date, 'yyyy-MM-dd');
                      router.push(`/dashboard/daily-schedule/${formattedDate}`);
                      setIsAddPopoverOpen(false);
                    }
                  }}
                  disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Main Content - Stack on mobile, side-by-side on large screens */}
      <div className="flex flex-col lg:grid lg:grid-cols-[70%_30%] gap-4 md:gap-6">
        {/* Calendar Card */}
        <Card className="max-w-screen">
          <CardHeader className="pb-3 space-y-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              Calendar
            </CardTitle>

            {/* Controls */}
            <div className="flex flex-col space-y-2">
              {/* View Switcher */}
              <div className="flex items-center gap-1 border rounded-md p-1 w-full justify-center">
                <Button
                  variant={view === Views.MONTH ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 sm:h-8 flex-1 text-xs sm:text-sm px-1 sm:px-2"
                  onClick={() => setView(Views.MONTH)}
                >
                  <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden xs:inline">Month</span>
                </Button>
                <Button
                  variant={view === Views.WEEK ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 sm:h-8 flex-1 text-xs sm:text-sm px-1 sm:px-2"
                  onClick={() => setView(Views.WEEK)}
                >
                  <Rows className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden xs:inline">Week</span>
                </Button>
                <Button
                  variant={view === Views.DAY ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 sm:h-8 flex-1 text-xs sm:text-sm px-1 sm:px-2"
                  onClick={() => setView(Views.DAY)}
                >
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden xs:inline">Day</span>
                </Button>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelected(new Date());
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-9 sm:w-9"
                  onClick={() => handleNavigate('prev')}
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <div className="flex-1 text-center text-xs sm:text-sm font-medium px-1 sm:px-2 min-w-0">
                  <div className="truncate">{getDateRangeText()}</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-9 sm:w-9"
                  onClick={() => handleNavigate('next')}
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2 px-2 sm:px-4 md:px-6 pb-4">
            <div className="h-[350px] xs:h-[400px] sm:h-[500px] md:h-[600px] w-full overflow-x-auto">
              <Calendar
                localizer={localizer}
                events={events}
                view={view}
                date={currentDate}
                onNavigate={setCurrentDate}
                onView={setView}
                toolbar={false}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={true}
                longPressThreshold={1}
                dayPropGetter={dayPropGetter}
                step={60}
                showMultiDayTimes
                defaultDate={new Date()}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: '#166534',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize:
                      view === Views.MONTH
                        ? window.innerWidth < 640
                          ? '12px'
                          : '14px'
                        : window.innerWidth < 640
                          ? '14px'
                          : '16px',
                    padding: '2px 4px',
                  },
                })}
                formats={{
                  timeGutterFormat: 'h A',
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer.format(start, 'h:mm A', culture)} - ${localizer.format(end, 'h:mm A', culture)}`,
                  agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer.format(start, 'h:mm A', culture)} - ${localizer.format(end, 'h:mm A', culture)}`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Events List Card */}
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              <span className="hidden sm:inline">Schedules on {formatDate(selected, 'PPP')}</span>
              <span className="sm:hidden">Schedules on {formatDate(selected, 'MMM d')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            {todaysList.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                No schedules yet for this date.
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3">
                {todaysList
                  .filter(item => !item.isHidden)
                  .map(item => (
                    <li
                      key={item._id}
                      className="rounded-md border p-2 sm:p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-sm sm:text-base">
                              {item.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {formatTimeTo12Hour(item.time)} • {item.location}{' '}
                              {item.category && `• ${item.category}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2 sm:h-8 sm:px-3 shrink-0"
                            onClick={() => router.push(`/dashboard/daily-schedule/${item.date}`)}
                          >
                            View
                          </Button>
                        </div>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-time-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
        }
        .rbc-time-header {
          border-bottom: 1px solid hsl(var(--border));
        }
        .rbc-time-content {
          border-top: 1px solid hsl(var(--border));
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.3);
        }
        .rbc-timeslot-group {
          min-height: 40px;
        }
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
        }
        .rbc-header {
          padding: 4px 2px;
          font-size: 10px;
        }
        .rbc-date-cell {
          padding: 2px;
          font-size: 10px;
        }

        /* Extra small screens */
        @media (max-width: 475px) {
          .rbc-calendar {
            min-width: 300px;
          }
          .rbc-header {
            padding: 3px 1px;
            font-size: 8px;
          }
          .rbc-date-cell {
            padding: 1px;
            font-size: 8px;
          }
          .rbc-event {
            font-size: 7px !important;
            padding: 1px 2px !important;
          }
          .rbc-timeslot-group {
            min-height: 35px;
          }
          .rbc-time-slot {
            font-size: 8px;
          }
        }

        /* Small screens */
        @media (max-width: 640px) {
          .rbc-toolbar {
            flex-direction: column;
            gap: 8px;
          }
          .rbc-header {
            padding: 4px 1px;
            font-size: 9px;
          }
          .rbc-date-cell {
            padding: 2px;
            font-size: 9px;
          }
          .rbc-event {
            font-size: 8px !important;
            padding: 1px 2px !important;
          }
          .rbc-time-header-content {
            margin: 0 auto;
          }
          .rbc-overflowing {
            margin-right: -2px !important;
          }
          .rbc-time-content {
            min-width: 100%;
          }
          .rbc-timeslot-group {
            min-height: 40px;
          }
          .rbc-time-slot {
            font-size: 9px;
          }
          .rbc-time-gutter {
            width: 50px;
          }
        }

        /* Medium screens and up */
        @media (min-width: 640px) {
          .rbc-timeslot-group {
            min-height: 60px;
          }
          .rbc-header {
            padding: 6px 4px;
            font-size: 12px;
          }
          .rbc-date-cell {
            padding: 4px;
            font-size: 12px;
          }
        }

        /* Large screens and up */
        @media (min-width: 1024px) {
          .rbc-timeslot-group {
            min-height: 80px;
          }
        }

        /* Custom breakpoint for xs */
        @media (min-width: 475px) {
          .rbc-header {
            padding: 4px 2px;
            font-size: 10px;
          }
          .rbc-timeslot-group {
            min-height: 45px;
          }
        }
      `}</style>
    </div>
  );
}
