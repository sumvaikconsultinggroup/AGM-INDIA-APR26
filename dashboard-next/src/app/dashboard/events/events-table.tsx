'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Add this import for Next.js Image component
import axios from 'axios';
import { Edit, MoreHorizontal, Trash, Calendar, MapPin, Users, Info, AlignLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Type for event data
interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  description: string;
  eventImage: string;
  registeredUsers: string[];
}

export function EventsTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      
      if (response.data.success) {
        setEvents(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load events');
        toast.error('Error loading events', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
      toast.error('Error loading events', {
        description: 'Could not connect to the server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/events/${eventToDelete}`);
      
      if (response.data.success) {
        // Remove the deleted event from the state
        setEvents(events.filter(event => event._id !== eventToDelete));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error deleting event', {
        description: 'Something went wrong'
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setLoading(false);
    }
  };

  const openDetailsModal = (event: Event) => {
    setSelectedEvent(event);
    setDetailsModalOpen(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="hidden md:table-cell">Attendees</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(index => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to load events</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchEvents}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No events found</h3>
        <p className="text-sm text-muted-foreground mb-6">Get started by creating your first event.</p>
        <Button asChild>
          <Link href="/dashboard/events/new">Create a new event</Link>
        </Button>
      </div>
    );
  }

  // Function to generate event icon based on event name
  const getEventIcon = (eventName: string) => {
    const firstLetter = eventName.charAt(0).toUpperCase();
    const colors = [
      "bg-red-100 text-red-600", 
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600"
    ];
    const colorIndex = eventName.length % colors.length;
    
    return (
      <div className={`flex items-center justify-center w-10 h-10 rounded-md ${colors[colorIndex]}`}>
        <span className="text-lg font-bold">{firstLetter}</span>
      </div>
    );
  };

  // Data loaded successfully
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="hidden md:table-cell">Attendees</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map(event => (
              <TableRow 
                key={event._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDetailsModal(event)}
              >
                <TableCell className="p-2">
                  {event.eventImage ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      <Image
                        src={event.eventImage}
                        alt={event.eventName}
                        fill
                        sizes="40px"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  ) : (
                    getEventIcon(event.eventName)
                  )}
                </TableCell>
                <TableCell className="font-medium">{event.eventName}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {event.eventLocation}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {event.registeredUsers?.length || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openDetailsModal(event);
                      }}>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/events/edit/${event._id}`} onClick={(e) => e.stopPropagation()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event._id);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Event Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl p-0">
          {selectedEvent && (
            <>
              {/* Event Image Banner with close button overlay */}
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                {/* Close button positioned on the image */}
                <div className="absolute top-3 right-3 z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                {selectedEvent.eventImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedEvent.eventImage}
                      alt={selectedEvent.eventName}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{selectedEvent.eventName.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              {/* Content section with padding */}
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{selectedEvent.eventName}</DialogTitle>
                  <DialogDescription>
                    <Badge variant="outline" className="mt-2">
                      {selectedEvent.registeredUsers?.length || 0} Attendees
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid gap-4">
                        {/* Rest of your content remains the same */}
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Date & Time</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedEvent.eventDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Location</h4>
                            <p className="text-sm text-muted-foreground">{selectedEvent.eventLocation}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            <AlignLeft className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {selectedEvent.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleDelete(selectedEvent._id);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Event
                  </Button>
                  
                  <Button asChild>
                    <Link href={`/dashboard/events/edit/${selectedEvent._id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Event
                    </Link>
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
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