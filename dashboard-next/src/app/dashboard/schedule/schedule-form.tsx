'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Info, 
  CalendarClock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlot {
  period?: 'morning' | 'afternoon' | 'evening' | 'night' | 'whole day'; // Make period optional
  startDate: string;
  endDate?: string; // Make end date optional
}

interface ScheduleFormData {
  month: string;
  locations: string;
  timeSlots: TimeSlot[];
  onlyStartDate: boolean;
  maxPeople: number;
  appointment: boolean;
}

interface ScheduleFormProps {
  initialData?: {
    id?: string;
    month?: string;
    locations?: string;
    timeSlots?: TimeSlot[];
    appointment?: boolean;
    maxPeople?: number;
  };
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const periods = ['morning', 'afternoon', 'evening', 'night', 'whole day'];

export function ScheduleForm({ initialData }: ScheduleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if initial data has time slots
  const hasInitialTimeSlots = initialData?.timeSlots && initialData.timeSlots.length > 0;

  // Check if initial time slots have period and end dates
  const hasOnlyStartDates = hasInitialTimeSlots &&
    initialData?.timeSlots?.every(slot => !slot.period && !slot.endDate);

  // Initialize react-hook-form
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<ScheduleFormData>({
    defaultValues: {
      month: initialData?.month || months[new Date().getMonth()],
      locations: initialData?.locations || '',
      onlyStartDate: hasOnlyStartDates || false,
      appointment: initialData?.appointment || false,
      maxPeople: initialData?.maxPeople || 100,
      timeSlots: initialData?.timeSlots || [{
        period: 'morning',
        startDate: new Date().toISOString().split('T')[0] + 'T09:00',
        endDate: new Date().toISOString().split('T')[0] + 'T12:00',
      }]
    }
  });

  // Watch for toggle states
  const onlyStartDate = watch('onlyStartDate');
  const timeSlots = watch('timeSlots');
  const appointment = watch('appointment');
  const maxPeople = watch('maxPeople');

  // Add new time slot
  const addTimeSlot = () => {
    const currentSlots = getValues('timeSlots');

    if (onlyStartDate) {
      // Add only start date
      setValue('timeSlots', [
        ...currentSlots,
        {
          startDate: new Date().toISOString().split('T')[0] + 'T09:00',
        }
      ]);
    } else {
      // Add full time slot
      setValue('timeSlots', [
        ...currentSlots,
        {
          period: 'morning',
          startDate: new Date().toISOString().split('T')[0] + 'T09:00',
          endDate: new Date().toISOString().split('T')[0] + 'T12:00',
        }
      ]);
    }
  };

  // Remove time slot
  const removeTimeSlot = (index: number) => {
    const currentSlots = getValues('timeSlots');
    if (currentSlots.length <= 1) {
      toast.error("You must have at least one time slot");
      return;
    }

    setValue('timeSlots', currentSlots.filter((_, i) => i !== index));
  };

  // Form submission handler
  const onSubmit: SubmitHandler<ScheduleFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      // Prepare payload - time slots are always included now
      const payload = {
        month: data.month,
        locations: data.locations,
        appointment: data.appointment,
        maxPeople: data.maxPeople,
        timeSlots: [] as TimeSlot[]
      };

      // Format time slots based on the onlyStartDate setting
      if (data.timeSlots.length > 0) {
        if (data.onlyStartDate) {
          // Format with only start dates
          payload.timeSlots = data.timeSlots.map(slot => ({
            startDate: new Date(slot.startDate).toISOString(),
          }));
        } else {
          // Format with full time slot data
          payload.timeSlots = data.timeSlots.map(slot => ({
            period: slot.period,
            startDate: new Date(slot.startDate).toISOString(), // Always has time
            // If it's a whole day, the endDate might not have a time, so we need to handle it.
            // The date input type returns 'YYYY-MM-DD'. We'll keep it as is.
            endDate: slot.endDate ? new Date(slot.endDate).toISOString() : undefined,
          }));
        }
      }

      let response;
      if (initialData?.id) {
        // Update existing schedule
        response = await axios.put(`/api/schedule/${initialData.id}`, payload);
      } else {
        // Create new schedule
        response = await axios.post('/api/schedule', payload);
      }

      if (response.data.success) {
        toast.success(initialData?.id ? 'Schedule updated successfully' : 'Schedule created successfully');
        router.push('/dashboard/schedule');
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate end time is after start time for a time slot
  const validateEndTime = (endTime: string, startTime: string) => {
    if (!endTime || !startTime) return true;
    return new Date(endTime) >= new Date(startTime) || "End date must be on or after the start date";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData?.id ? 'Edit Schedule' : 'Create Schedule'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month Selection */}
          <div className="grid gap-3">
            <Label htmlFor="month">Month</Label>
            <Controller
              name="month"
              control={control}
              rules={{ required: "Month is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month.message}</p>
            )}
          </div>

          {/* Locations */}
          <div className="grid gap-3">
            <Label htmlFor="locations">Locations</Label>
            <Textarea
              id="locations"
              {...register("locations", { required: "Locations are required" })}
              placeholder="Enter locations (comma separated or with line breaks)"
              rows={3}
            />
            {errors.locations && (
              <p className="text-sm text-red-500">{errors.locations.message}</p>
            )}
          </div>

          {/* Appointment Settings Section */}
          <div className="bg-gray-50 p-5 rounded-lg border space-y-6">
            <h3 className="font-medium text-lg flex items-center text-gray-700">
              <CalendarClock className="h-5 w-5 mr-2 text-purple-600" />
              Appointment Settings
            </h3>
            
            {/* Appointment Toggle */}
            <div className="border p-4 rounded-lg bg-purple-50">
              <div className="flex items-center space-x-2 mb-2">
                <Controller
                  name="appointment"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="appointment" className="font-medium">Enable Appointment Requests</Label>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                Allow devotees to request appointments for this schedule. This will make this schedule visible on the appointment request form.
              </p>
            </div>

            {/* Max People - Displayed more prominently when appointments are enabled */}
            <div className={`grid gap-3 ${appointment ? 'border p-4 rounded-lg bg-blue-50' : ''}`}>
              <div className="flex items-center">
                <Label htmlFor="maxPeople" className={appointment ? 'font-medium' : ''}>
                  Max People Per Appointment
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Maximum number of people that can attend each appointment. This helps manage the size of groups.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-4 items-center">
                <div className={appointment ? 'flex-1' : 'w-32'}>
                  <Input
                    id="maxPeople"
                    type="number"
                    {...register("maxPeople", { 
                      valueAsNumber: true, 
                      min: {
                        value: 1,
                        message: "At least 1 person must be allowed"
                      },
                      max: {
                        value: 1000,
                        message: "Maximum people cannot exceed 1000"
                      }
                    })}
                  />
                </div>
              </div>
              {errors.maxPeople && (
                <p className="text-sm text-red-500">{errors.maxPeople.message}</p>
              )}
              {appointment && (
                <p className="text-sm text-blue-700">
                  This will limit the number of people that can be included in a single appointment request.
                </p>
              )}
            </div>
          </div>

          {/* Time Slot Format Toggle */}
          <div className="flex items-center space-x-2">
            <Controller
              name="onlyStartDate"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);

                    // Convert existing time slots to the new format
                    const currentSlots = getValues('timeSlots');
                    if (checked) {
                      // Convert to start date only
                      setValue('timeSlots', currentSlots.map(slot => ({
                        startDate: slot.startDate
                      })));
                    } else {
                      // Convert to full time slots
                      setValue('timeSlots', currentSlots.map(slot => ({
                        period: 'morning',
                        startDate: slot.startDate,
                        endDate: new Date(new Date(slot.startDate).getTime() + 3 * 60 * 60 * 1000).toISOString().substring(0, 16)
                      })));
                    }
                  }}
                />
              )}
            />
            <Label htmlFor="onlyStartDate">Only Use Start Dates (No Period or End Date)</Label>
          </div>

          {/* Time Slots Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{onlyStartDate ? 'Dates' : 'Time Slots'}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-2" /> Add {onlyStartDate ? 'Date' : 'Time Slot'}
              </Button>
            </div>

            {timeSlots.map((slot, index) => {
              const isWholeDay = watch(`timeSlots.${index}.period`) === 'whole day';
              const showEndDate = !onlyStartDate;

              return (
              <Card key={index} className="p-4 shadow-sm">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {onlyStartDate ? `Date ${index + 1}` : `Time Slot ${index + 1}`}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeSlot(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Period Selection - Only show if not using start date only */}
                  {showEndDate && (
                    <div className="grid gap-3">
                      <Label htmlFor={`timeSlots.${index}.period`}>Period</Label>
                      <Controller
                        name={`timeSlots.${index}.period`}
                        control={control}
                        rules={{
                          required: !onlyStartDate ? "Period is required" : false
                        }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger id={`timeSlots.${index}.period`}>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              {periods.map(period => (
                                <SelectItem key={period} value={period}>
                                  {period.charAt(0).toUpperCase() + period.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.timeSlots?.[index]?.period && (
                        <p className="text-sm text-red-500">{errors.timeSlots[index].period?.message}</p>
                      )}
                    </div>
                  )}

                  {/* Date/Time Selection */}
                  <div className={`grid grid-cols-1 gap-4 ${showEndDate ? 'md:grid-cols-2' : ''}`}>
                    <div className="grid gap-2">
                      <Label htmlFor={`timeSlots.${index}.startDate`}>
                        {onlyStartDate ? 'Date & Time' : isWholeDay ? 'Start Date' : 'Start Date & Time'}
                      </Label>
                      <Input
                        id={`timeSlots.${index}.startDate`}
                        type={isWholeDay ? 'date' : 'datetime-local'}
                        {...register(`timeSlots.${index}.startDate`, {
                          required: "Date is required"
                        })}
                      />
                      {errors.timeSlots?.[index]?.startDate && (
                        <p className="text-sm text-red-500">{errors.timeSlots[index]?.startDate?.message}</p>
                      )}
                    </div>

                    {/* End Date - Only show if not using start date only */}
                    {showEndDate && (
                      <div className="grid gap-2">
                        <Label htmlFor={`timeSlots.${index}.endDate`}>{isWholeDay ? 'End Date' : 'End Date & Time'}</Label>
                        <Input
                          id={`timeSlots.${index}.endDate`}
                          type={isWholeDay ? 'date' : 'datetime-local'}
                          {...register(`timeSlots.${index}.endDate`, {
                            required: showEndDate ? "End date is required" : false,
                            validate: showEndDate ?
                              (value) => validateEndTime(
                                value || '',
                                watch(`timeSlots.${index}.startDate`)
                              ) : undefined
                          })}
                        />
                        {errors.timeSlots?.[index]?.endDate && (
                          <p className="text-sm text-red-500">{errors.timeSlots[index]?.endDate?.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )})}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Info Card - Only show if appointment is enabled */}
      {appointment && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Appointment Schedule Active</h3>
                <p className="text-sm text-blue-700 mb-4">
                  This schedule will be visible on the appointment request form. Devotees will be able to request appointments for the dates and times youve specified.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center bg-white px-3 py-2 rounded-md border border-blue-200">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    <span><strong>{maxPeople}</strong> people per appointment</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/schedule')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={appointment ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          {isSubmitting
            ? 'Saving...'
            : initialData?.id
              ? 'Update Schedule'
              : 'Create Schedule'
          }
          {appointment && !isSubmitting && <Clock className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}