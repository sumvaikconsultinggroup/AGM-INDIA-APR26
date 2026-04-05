'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Edit, 
  MoreHorizontal, 
  Trash, 
  Calendar, 
  Clock, 
  MapPin, 
  Info,
  CalendarClock,
  Users,
  Check,
  X,
  AlertCircle
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
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Interface for schedule data based on updated schema
interface TimeSlot {
  _id: string;
  period?: 'morning' | 'afternoon' | 'evening' | 'night'; // Made optional
  startDate: string;
  endDate?: string; // Made optional
}

interface Schedule {
  _id: string;
  month: string;
  locations: string;
  timeSlots: TimeSlot[];
  appointment: boolean; // Added appointment flag
  maxPeople: number; // Added maxPeople field
  createdAt: string;
  updatedAt: string;
}

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [maxPeopleInput, setMaxPeopleInput] = useState<number>(100);
  const [isEditingMaxPeople, setIsEditingMaxPeople] = useState(false);

  // Fetch schedules when component mounts
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Set initial maxPeople value when selected schedule changes
  useEffect(() => {
    if (selectedSchedule) {
      setMaxPeopleInput(selectedSchedule.maxPeople || 100);
    }
  }, [selectedSchedule]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schedule');
      
      if (response.data.success) {
        setSchedules(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load schedules');
        toast.error('Error loading schedules', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules. Please try again later.');
      toast.error('Error loading schedules', {
        description: 'Could not connect to the server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/schedule/${scheduleToDelete}`);
      
      if (response.data.success) {
        // Remove the deleted schedule from the state
        setSchedules(schedules.filter(schedule => schedule._id !== scheduleToDelete));
        toast.success('Schedule deleted successfully');
      } else {
        toast.error('Failed to delete schedule', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Error deleting schedule', {
        description: 'Something went wrong'
      });
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
      setLoading(false);
    }
  };

  const toggleAppointment = async (scheduleId: string, currentValue: boolean) => {
    if (!scheduleId) return;
    
    try {
      setIsUpdating(true);
      const schedule = schedules.find(s => s._id === scheduleId);
      
      if (!schedule) {
        toast.error('Schedule not found');
        return;
      }
      
      const response = await axios.put(`/api/schedule/${scheduleId}`, {
        month: schedule.month,
        locations: schedule.locations,
        timeSlots: schedule.timeSlots,
        maxPeople: schedule.maxPeople || 100,
        appointment: !currentValue
      });
      
      if (response.data.success) {
        // Update the schedules state with the new appointment value
        setSchedules(schedules.map(s => 
          s._id === scheduleId ? { ...s, appointment: !currentValue } : s
        ));
        
        toast.success(`Appointments ${!currentValue ? 'enabled' : 'disabled'} for ${schedule.month}`);
        
        // Update selected schedule if in details view
        if (selectedSchedule && selectedSchedule._id === scheduleId) {
          setSelectedSchedule({ ...selectedSchedule, appointment: !currentValue });
        }
      } else {
        toast.error('Failed to update appointment setting', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error updating appointment setting:', error);
      toast.error('Error updating appointment setting', {
        description: 'Something went wrong'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateMaxPeople = async () => {
    if (!selectedSchedule) return;
    
    // Validate the input
    if (maxPeopleInput < 1) {
      toast.error('Maximum people must be at least 1');
      return;
    }
    
    if (maxPeopleInput > 1000) {
      toast.error('Maximum people cannot exceed 1000');
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const response = await axios.put(`/api/schedule/${selectedSchedule._id}`, {
        month: selectedSchedule.month,
        locations: selectedSchedule.locations,
        timeSlots: selectedSchedule.timeSlots,
        appointment: selectedSchedule.appointment,
        maxPeople: maxPeopleInput
      });
      
      if (response.data.success) {
        // Update the schedules state with the new maxPeople value
        setSchedules(schedules.map(s => 
          s._id === selectedSchedule._id ? { ...s, maxPeople: maxPeopleInput } : s
        ));
        
        // Update selected schedule
        setSelectedSchedule({ ...selectedSchedule, maxPeople: maxPeopleInput });
        
        toast.success(`Maximum people updated to ${maxPeopleInput}`);
        setIsEditingMaxPeople(false);
      } else {
        toast.error('Failed to update maximum people', {
          description: response.data.message
        });
      }
    } catch (error) {
      console.error('Error updating maximum people:', error);
      toast.error('Error updating maximum people', {
        description: 'Something went wrong'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetailsModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailsModalOpen(true);
    setMaxPeopleInput(schedule.maxPeople || 100);
    setIsEditingMaxPeople(false);
  };

  // Function to get period badge color
  const getPeriodBadge = (period?: string) => {
    if (!period) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    
    const colors = {
      morning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      afternoon: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      evening: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      night: "bg-blue-100 text-blue-800 hover:bg-blue-100"
    };
    
    return colors[period as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Function to display slot label based on period or date
  const getSlotLabel = (slot: TimeSlot) => {
    if (slot.period) {
      return slot.period.charAt(0).toUpperCase() + slot.period.slice(1);
    } else {
      // If no period, display date format
      return formatDate(slot.startDate).split(',')[0]; // Show just the day and month
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Time Slots</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead className="hidden md:table-cell">Max People</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4].map(index => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-28" /></TableCell>
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
        <h3 className="text-lg font-semibold mb-2">Unable to load schedules</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchSchedules}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!schedules.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
        <p className="text-sm text-muted-foreground mb-6">Get started by creating your first schedule.</p>
        <Button asChild>
          <Link href="/dashboard/schedule/new">Create a new schedule</Link>
        </Button>
      </div>
    );
  }

  // Data loaded successfully
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Time Slots</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead className="hidden md:table-cell">Max People</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map(schedule => (
              <TableRow 
                key={schedule._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDetailsModal(schedule)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {schedule.month}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="truncate max-w-[200px]" title={schedule.locations}>
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground inline-block" />
                    {schedule.locations.split(/[,\n]/)[0].trim()}
                    {schedule.locations.includes(',') || schedule.locations.includes('\n') ? '...' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  {schedule.timeSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {schedule.timeSlots.slice(0, 3).map((slot, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={getPeriodBadge(slot.period)}
                        >
                          {getSlotLabel(slot)}
                        </Badge>
                      ))}
                      {schedule.timeSlots.length > 3 && (
                        <Badge variant="outline">
                          +{schedule.timeSlots.length - 3} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No time slots</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Switch 
                      checked={schedule.appointment || false}
                      onCheckedChange={() => toggleAppointment(schedule._id, schedule.appointment || false)}
                      disabled={isUpdating}
                      className="mr-2"
                    />
                    {schedule.appointment ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <CalendarClock className="h-3 w-3 mr-1" /> Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span>{schedule.maxPeople || 100}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">Max people per appointment</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDate(schedule.createdAt)}
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
                        openDetailsModal(schedule);
                      }}>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          href={`/dashboard/schedule/${schedule._id}`} 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(schedule._id);
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

      {/* Schedule Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold">
                        {selectedSchedule.month} Schedule
                      </DialogTitle>
                      <DialogDescription>
                        <span className="text-sm">
                          Created: {formatDate(selectedSchedule.createdAt)}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>
                  
                  {/* Appointment status badge */}
                  {selectedSchedule.appointment ? (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <CalendarClock className="h-3 w-3 mr-1" /> Appointments Enabled
                    </Badge>
                  ) : null}
                </div>
              </DialogHeader>

              {/* Appointment settings section */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 pb-2">
                  <CardTitle className="text-lg flex items-center text-purple-900">
                    <CalendarClock className="h-5 w-5 mr-2 text-purple-700" />
                    Appointment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Appointment toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="font-medium">Enable Appointment Requests</span>
                    </div>
                    <Switch 
                      checked={selectedSchedule.appointment || false}
                      onCheckedChange={() => toggleAppointment(
                        selectedSchedule._id, 
                        selectedSchedule.appointment || false
                      )}
                      disabled={isUpdating}
                    />
                  </div>

                  {/* Max people setting */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="font-medium">Max People Per Appointment</span>
                    </div>

                    {isEditingMaxPeople ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          className="w-20"
                          value={maxPeopleInput}
                          onChange={(e) => setMaxPeopleInput(parseInt(e.target.value) || 0)}
                          disabled={isUpdating}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={updateMaxPeople} 
                          disabled={isUpdating}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setIsEditingMaxPeople(false);
                            setMaxPeopleInput(selectedSchedule.maxPeople || 100);
                          }} 
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className="flex items-center bg-white"
                        >
                          <Users className="h-3 w-3 mr-1 text-blue-600" />
                          <span>{selectedSchedule.maxPeople || 100}</span>
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setIsEditingMaxPeople(true)}
                        >
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Appointment explanation */}
                  {selectedSchedule.appointment ? (
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800 mb-1">This schedule is visible on the appointment request form</p>
                        <p>Devotees can request appointments for the times and dates listed below.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center bg-white px-2 py-1 rounded text-xs border border-blue-100">
                            <Clock className="h-3 w-3 mr-1 text-blue-600" />
                            <span>{selectedSchedule.timeSlots.length} time slots</span>
                          </div>
                          <div className="flex items-center bg-white px-2 py-1 rounded text-xs border border-blue-100">
                            <Users className="h-3 w-3 mr-1 text-blue-600" />
                            <span>Up to {selectedSchedule.maxPeople || 100} people per appointment</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 flex items-start">
                      <Info className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>
                        Appointments are currently disabled for this schedule. Enable appointments to make this schedule visible on the appointment request form.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="my-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    LOCATIONS
                  </h4>
                  <div className="bg-muted/20 rounded-md p-3">
                    <p className="whitespace-pre-line">{selectedSchedule.locations}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    TIME SLOTS
                  </h4>
                  
                  {selectedSchedule.timeSlots.length > 0 ? (
                    <div className="relative border rounded-md">
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="p-4 space-y-3">
                          {selectedSchedule.timeSlots.map((slot, index) => (
                            <Card key={index} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  {slot.period ? (
                                    <Badge 
                                      variant="outline"
                                      className={getPeriodBadge(slot.period)}
                                    >
                                      {slot.period.charAt(0).toUpperCase() + slot.period.slice(1)}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      Date Only
                                    </Badge>
                                  )}
                                  <div className="text-sm text-muted-foreground">
                                    Slot {index + 1}
                                  </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Start</p>
                                    <p className="font-medium">
                                      {formatDate(slot.startDate)}
                                    </p>
                                    <p className="text-sm">
                                      {formatTime(slot.startDate)}
                                    </p>
                                  </div>
                                  {slot.endDate && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">End</p>
                                      <p className="font-medium">
                                        {formatDate(slot.endDate)}
                                      </p>
                                      <p className="text-sm">
                                        {formatTime(slot.endDate)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="bg-muted/20 rounded-md p-6 text-center">
                      <p className="text-muted-foreground">No time slots for this schedule</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleDelete(selectedSchedule._id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Schedule
                </Button>

                <Button asChild>
                  <Link href={`/dashboard/schedule/${selectedSchedule._id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Schedule
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
              This action cannot be undone. This will permanently delete this schedule.
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
