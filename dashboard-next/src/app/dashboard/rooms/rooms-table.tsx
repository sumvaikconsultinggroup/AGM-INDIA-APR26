'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import {
  Edit,
  MoreHorizontal,
  Trash,
  BedDouble,
  Calendar,
  Home,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for room booking data based on schema
interface RoomBooking {
  _id: string;
  name: string;
  place: string;
  price: number;
  date: string[]; // API will return date strings
  available: boolean;
  occupancy: number;
  email: string;
  userId?: string;
  isBooked: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  description?: string;
  amenities?: string[];
}

export function RoomsTable() {
  const [rooms, setRooms] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomBooking | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch rooms when component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/roombooking');

      if (response.data.success) {
        setRooms(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load rooms');
        toast.error('Error loading rooms', {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again later.');
      toast.error('Error loading rooms', {
        description: 'Could not connect to the server',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setRoomToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      setLoading(true);
      const response = await axios.delete(`/api/roombooking/${roomToDelete}`);

      if (response.data.success) {
        // Remove the deleted room from the state
        setRooms(rooms.filter(room => room._id !== roomToDelete));
        toast.success('Room deleted successfully');
      } else {
        toast.error('Failed to delete room', {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Error deleting room', {
        description: 'Something went wrong',
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
      setLoading(false);
    }
  };

  const openDetailsModal = (room: RoomBooking) => {
    setCurrentImageIndex(0);
    setSelectedRoom(room);
    setDetailsModalOpen(true);
  };

  const nextImage = () => {
    if (!selectedRoom?.images?.length) return;
    setCurrentImageIndex(prev => (prev === (selectedRoom?.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!selectedRoom?.images?.length) return;
    setCurrentImageIndex(prev => (prev === 0 ? (selectedRoom?.images?.length || 1) - 1 : prev - 1));
  };

  // Format dates to display as a range or list
  const formatDateRange = (dates: string[]) => {
    if (!dates || dates.length === 0) return 'No dates';

    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString();
    }

    // Sort dates
    const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Check if dates are consecutive
    let isConsecutive = true;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);

      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays !== 1) {
        isConsecutive = false;
        break;
      }
    }

    if (isConsecutive) {
      return `${new Date(sortedDates[0]).toLocaleDateString()} - ${new Date(
        sortedDates[sortedDates.length - 1]
      ).toLocaleDateString()}`;
    } else {
      return sortedDates.map(date => new Date(date).toLocaleDateString()).join(', ');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get room image or placeholder
  const getRoomImage = (room: RoomBooking) => {
    if (room.images && room.images.length > 0) {
      return (
        <div className="relative w-10 h-10 rounded-md overflow-hidden">
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            sizes="40px"
            style={{ objectFit: 'cover' }}
            priority={false}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
        <BedDouble className="h-5 w-5 text-primary" />
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead>Place</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead className="hidden md:table-cell">Dates</TableHead>
              <TableHead className="hidden md:table-cell">Occupancy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(index => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[80px]" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-[180px]" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[90px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
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
          <BedDouble className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to load rooms</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchRooms}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!rooms.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <BedDouble className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
        <p className="text-sm text-muted-foreground mb-6">Get started by adding your first room.</p>
        <Button asChild>
          <Link href="/dashboard/rooms/new">Add a new room</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Room Name</TableHead>
              <TableHead>Place</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead className="hidden md:table-cell">Dates</TableHead>
              <TableHead className="hidden md:table-cell">Occupancy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map(room => (
              <TableRow
                key={room._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDetailsModal(room)}
              >
                <TableCell className="p-2">{getRoomImage(room)}</TableCell>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>{room.place}</TableCell>
                <TableCell>₹{room.price}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDateRange(room.date)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {room.occupancy} {room.occupancy > 1 ? 'persons' : 'person'}
                </TableCell>
                <TableCell>
                  {room.isBooked ? (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                    >
                      Booked
                    </Badge>
                  ) : room.available ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50"
                    >
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                      Unavailable
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          openDetailsModal(room);
                        }}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/rooms/edit/${room._id}`}
                          onClick={e => e.stopPropagation()}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(room._id);
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

      {/* Room Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedRoom.name}</DialogTitle>
                <DialogDescription className="text-base">{selectedRoom.place}</DialogDescription>
              </DialogHeader>

              {/* Image Carousel */}
              {selectedRoom.images && selectedRoom.images.length > 0 ? (
                <div className="relative aspect-video overflow-hidden rounded-md mb-4">
                  {/* Main Image Display */}
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedRoom.images[currentImageIndex]}
                      alt={`${selectedRoom.name} - Image ${currentImageIndex + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover transition-opacity duration-300"
                      priority
                    />
                  </div>

                  {/* Navigation Arrows (visible only when multiple images) */}
                  {selectedRoom.images.length > 1 && (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2
                                  text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2
                                  text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {selectedRoom.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      {currentImageIndex + 1} / {selectedRoom.images.length}
                    </div>
                  )}

                  {/* Image Dots/Pagination */}
                  {selectedRoom.images.length > 1 && (
                    <div className="flex gap-1.5 absolute bottom-3 left-0 right-0 justify-center">
                      {selectedRoom.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-muted/20 rounded-md aspect-video mb-4">
                  <BedDouble className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Room Description */}
              {selectedRoom.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedRoom.description}</p>
              )}

              {/* Room Amenities */}
              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Amenities:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoom.amenities.map(amenity => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 py-4">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      ROOM DETAILS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Price:</div>
                      <div className="text-sm">₹{selectedRoom.price}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Occupancy:</div>
                      <div className="text-sm">
                        {selectedRoom.occupancy} {selectedRoom.occupancy > 1 ? 'persons' : 'person'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Status:</div>
                      <div className="text-sm">
                        {selectedRoom.isBooked ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            Booked
                          </Badge>
                        ) : selectedRoom.available ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm font-medium">Contact:</div>
                      <div className="text-sm">{selectedRoom.email}</div>
                    </div>
                    {selectedRoom.createdAt && (
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-sm font-medium">Created:</div>
                        <div className="text-sm">{formatDate(selectedRoom.createdAt)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    AVAILABLE DATES
                  </h3>
                  <div className="bg-muted/20 rounded-md p-3">
                    <p className="text-sm">{formatDateRange(selectedRoom.date)}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleDelete(selectedRoom._id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Room
                </Button>

                <Button asChild>
                  <Link href={`/dashboard/rooms/${selectedRoom._id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Room
                  </Link>
                </Button>
              </DialogFooter>
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
              This action cannot be undone. This will permanently delete this room from the system.
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
