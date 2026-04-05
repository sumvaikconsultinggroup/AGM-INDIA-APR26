'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  FileDown,
  CalendarRange, // Added for reschedule
} from 'lucide-react';
import Link from 'next/link';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast, Toaster } from 'sonner';
import Papa from 'papaparse';

// Type definition for registration
type RegistrationStatus = 'PENDING' | 'Pending' | 'APPROVED' | 'Approved' | 'REJECTED' | 'Rejected';

interface RequestedSchedule {
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
  preferedTime?: string;
  additionalInfo?: string;
  requestDate: Date;
  status: RegistrationStatus;
  isDeleted: boolean;
  reschedule?: boolean; // Added for reschedule feature
  rescheduleDate?: Date; // Added for reschedule feature
  requestedSchedule: RequestedSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export default function DateRegistrationsPage() {
  const params = useParams();
  const dateString = params.date as string;
  const dateObj = new Date(dateString);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Added for reschedule feature
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Fetch registrations for this date using axios
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/getSomeSchedule/${dateString}?date=${dateString}`);

      console.log('Fetched registrations:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch registrations');
      }

      // Transform the data to handle Date objects and normalize status
      const transformedData = response.data.data.map((reg: Registration) => ({
        ...reg,
        _id: reg._id,
        status: (reg.status || 'PENDING').toUpperCase() as RegistrationStatus,
        requestDate: new Date(reg.requestDate),
        createdAt: new Date(reg.createdAt),
        updatedAt: new Date(reg.updatedAt),
        rescheduleDate: reg.rescheduleDate ? new Date(reg.rescheduleDate) : undefined,
        requestedSchedule: reg.requestedSchedule
          ? {
            ...reg.requestedSchedule,
            eventDate: reg.requestedSchedule.eventDate
              ? new Date(reg.requestedSchedule.eventDate)
              : undefined,
            eventTime: reg.requestedSchedule.eventTime
              ? reg.requestedSchedule.eventTime.split('(')[0].trim()
              : undefined,
          }
          : {},
      }));
      console.log('Transformed data:', transformedData);


      setRegistrations(transformedData);
    } catch (err) {
      console.error('Error fetching registrations:', err);

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error('Failed to load registrations', {
          description: errorMessage,
        });
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load registrations', {
          description: 'Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSimpleDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatPurpose = (purpose: string): string => {
    return purpose
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      setIsExporting(true);

      // Prepare data for CSV export
      const csvData = registrations.map(registration => {
        return {
          Name: registration.name,
          Email: registration.email,
          Phone: registration.phone,
          Purpose: formatPurpose(registration.purpose),
          'Preferred Time': registration.preferedTime || 'Not specified',
          Status: registration.status,
          'Registration Date': formatSimpleDate(registration.createdAt),
          'Event Date': registration.requestedSchedule.eventDate
            ? formatSimpleDate(registration.requestedSchedule.eventDate)
            : 'Not specified',
          'Event Time': registration.requestedSchedule.eventTime || 'Not specified',
          'Event Location':
            registration.requestedSchedule.eventLocation || 'Not specified',
          'Event Details': registration.requestedSchedule.eventDetails || 'None',
          'Additional Information': registration.additionalInfo || 'None',
          'Rescheduled': registration.reschedule ? 'Yes' : 'No',
          'Rescheduled Date': registration.rescheduleDate
            ? formatSimpleDate(registration.rescheduleDate)
            : 'N/A',
          'Last Updated': formatSimpleDate(registration.updatedAt),
        };
      });

      // Convert to CSV
      const csv = Papa.unparse(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Generate filename with date
      const formattedDate = dateString.split('T')[0].replace(/-/g, '');

      link.setAttribute('href', url);
      link.setAttribute('download', `Schedule-Registrations-${formattedDate}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAction = (registration: Registration, action: 'approve' | 'reject') => {
    setSelectedRegistration(registration);
    setActionType(action);
    setActionDialogOpen(true);
  };

  // Added for reschedule feature
  const handleReschedule = (registration: Registration) => {
    setSelectedRegistration(registration);
    setSelectedDate(undefined); // Reset date selection
    setRescheduleDialogOpen(true);
  };

  // Handle reschedule confirmation
  const confirmReschedule = async () => {
    if (!selectedRegistration || !selectedDate) {
      toast.error('Please select a date for rescheduling');
      return;
    }

    try {
      setIsRescheduling(true);

      // Format date to ISO string for the API
      const formattedDate = selectedDate.toISOString();

      // Create a FormData object to send the data
      const formData = new FormData();
      formData.append('reschedule', 'true'); // Still mark as rescheduled
      formData.append('rescheduleDate', formattedDate); // Keep for tracking original reschedule date
      // Add the new field to update the eventDate in requestedSchedule
      formData.append('requestedSchedule[eventDate]', formattedDate);

      // Using axios to update the registration
      const response = await axios.put(
        `/api/scheduleRegistration/${selectedRegistration._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reschedule registration');
      }

      // Update local state to reflect the change
      const updatedRegistrations = registrations.map(reg => {
        if (reg._id === selectedRegistration._id) {
          return {
            ...reg,
            reschedule: true,
            rescheduleDate: selectedDate,
            // Also update the eventDate in requestedSchedule
            requestedSchedule: {
              ...reg.requestedSchedule,
              eventDate: selectedDate
            },
            updatedAt: new Date(),
          };
        }
        return reg;
      });

      setRegistrations(updatedRegistrations);

      // Show success toast
      toast.success('Registration Rescheduled', {
        description: `The appointment for ${selectedRegistration.name} has been rescheduled to ${formatDate(selectedDate)}.`,
      });

      // Send email notification about rescheduling
      try {
        const eventDate = selectedRegistration.requestedSchedule.eventDate
          ? formatDate(selectedRegistration.requestedSchedule.eventDate)
          : 'the requested date';

        const eventLocation = selectedRegistration.requestedSchedule.eventLocation || 'the specified location';
        const eventTime = selectedRegistration.requestedSchedule.eventTime || 'the scheduled time';

        // Email content for rescheduled appointment
        const emailData = {
          to: selectedRegistration.email,
          subject: 'Hari Om 🌼 – Your Appointment with Swami Ji Has Been Rescheduled',
          text: `Hari Om, ${selectedRegistration.name} 🙏

With the divine blessings of Pujya Swami Avdheshanand Giri Ji Maharaj, your appointment has been rescheduled.

✨ "प्रतीक्षा भी एक तपस्या है, जो आत्मा को परिपक्व करती है।" ✨

We appreciate your understanding as we manage Swami Ji's schedule for his USA visit.

🪔 Rescheduled Appointment Details
Purpose: ${formatPurpose(selectedRegistration.purpose)}

Original Date: ${eventDate}

Rescheduled Date: ${formatDate(selectedDate)}

Time: ${eventTime}

Location: ${eventLocation}

We humbly request you to:
Arrive 15 minutes early.

Maintain the sanctity of silence and devotion.

Carry this confirmation email for reference.

With Blessings of Swami Ji,
Seva Team – Avdheshanand Giri Mission

🌸 "Patience in spiritual journey leads to profound revelations." – Swami Avdheshanand Giri Ji 🌸`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #fcfcfc;">
  <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f8f5ff;">
    <h1 style="color: #7e57c2; font-size: 24px; margin: 0;">🌼 Hari Om – Appointment Rescheduled 🌼</h1>
  </div>
  
  <p style="font-size: 16px;">Hari Om, <strong>${selectedRegistration.name}</strong> 🙏</p>
  
  <p style="font-size: 16px;">With the divine blessings of Pujya Swami Avdheshanand Giri Ji Maharaj, your appointment has been rescheduled.</p>
  
  <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #faf8ff; font-style: italic;">
    <p style="color: #5d4777;">✨ "प्रतीक्षा भी एक तपस्या है, जो आत्मा को परिपक्व करती है।" ✨</p>
  </div>
  
  <p style="font-size: 16px;">We appreciate your understanding as we manage Swami Ji's schedule for his USA visit.</p>
  
  <div style="background-color: #f9f9fc; border-left: 4px solid #b388ff; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5d4777;">🪔 Rescheduled Appointment Details</h3>
    
    <p style="margin-bottom: 15px;"><strong>Purpose:</strong> ${formatPurpose(selectedRegistration.purpose)}</p>
    
    <div style="display: flex; margin-bottom: 15px;">
      <div style="flex: 1; padding: 10px; background-color: #fff3e0; border-left: 2px solid #ffb74d; margin-right: 10px;">
        <p style="margin: 0; font-size: 13px; color: #b26a00;">Original Date</p>
        <p style="margin: 5px 0 0 0; font-weight: bold;">${eventDate}</p>
      </div>
      <div style="flex: 1; padding: 10px; background-color: #e3f2fd; border-left: 2px solid #64b5f6;">
        <p style="margin: 0; font-size: 13px; color: #0069c0;">New Date</p>
        <p style="margin: 5px 0 0 0; font-weight: bold;">${formatDate(selectedDate)}</p>
      </div>
    </div>
    
    <p style="margin-bottom: 15px;"><strong>Time:</strong> ${eventTime}</p>
    
    <p style="margin-bottom: 15px;"><strong>Location:</strong> ${eventLocation}</p>
  </div>
  
  <div style="background-color: #faf9f4; border-left: 4px solid #e9c46a; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5d4777;">We humbly request you to:</h3>
    
    <ul style="list-style-type: none; padding-left: 5px;">
      <li style="margin-bottom: 10px;">• Arrive 15 minutes early.</li>
      <li style="margin-bottom: 10px;">• Maintain the sanctity of silence and devotion.</li>
      <li style="margin-bottom: 10px;">• Carry this confirmation email for reference.</li>
    </ul>
  </div>
  
  <p style="font-size: 16px; margin-top: 25px;">With Blessings of Swami Ji,<br />Seva Team – Avdheshanand Giri Mission</p>
  
  <div style="text-align: center; margin-top: 30px; padding: 15px; border-top: 1px solid #eee; background-color: #f8f5ff; font-size: 14px; color: #5d4777; font-style: italic;">
    <p>🌸 "Patience in spiritual journey leads to profound revelations." – Swami Avdheshanand Giri Ji 🌸</p>
  </div>
</div>
          `,
        };

        // Send email via API endpoint
        const emailResponse = await axios.post('/api/sendemail', emailData);

        if (!emailResponse.data.success) {
          throw new Error(emailResponse.data.message || 'Failed to send rescheduling email');
        }

        console.log(`Rescheduling notification email sent to ${selectedRegistration.email}`);
      } catch (emailErr) {
        console.error('Failed to send rescheduling email:', emailErr);
        toast.warning('Registration rescheduled, but email notification failed', {
          description: "The registration was rescheduled, but we couldn't send an email notification.",
        });
      }

    } catch (err) {
      console.error('Error rescheduling registration:', err);

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        toast.error('Rescheduling Failed', {
          description: errorMessage,
        });
      } else {
        toast.error('Rescheduling Failed', {
          description: 'Failed to reschedule the registration. Please try again.',
        });
      }
    } finally {
      setRescheduleDialogOpen(false);
      setSelectedRegistration(null);
      setSelectedDate(undefined);
      setIsRescheduling(false);
    }
  };

  const confirmAction = async () => {
    if (!selectedRegistration || !actionType) return;

    try {
      setActionInProgress(true);

      // Create a FormData object to send the data
      const formData = new FormData();
      formData.append('status', actionType === 'approve' ? 'Approved' : 'Rejected');

      // Using axios with FormData
      const response = await axios.put(
        `/api/scheduleRegistration/${selectedRegistration._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update registration');
      }

      // Update local state to reflect the change
      const updatedRegistrations = registrations.map(reg => {
        if (reg._id === selectedRegistration._id) {
          return {
            ...reg,
            status: actionType === 'approve' ? 'APPROVED' : ('REJECTED' as RegistrationStatus),
            updatedAt: new Date(), // Update timestamp
          };
        }
        return reg;
      });

      setRegistrations(updatedRegistrations);

      // Send notification email
      try {
        const eventDate = selectedRegistration.requestedSchedule.eventDate
          ? new Date(selectedRegistration.requestedSchedule.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          : 'the requested date';

        const eventLocation =
          selectedRegistration.requestedSchedule.eventLocation || 'the specified location';
        const eventTime = selectedRegistration.requestedSchedule.eventTime || 'the scheduled time';

        // Email content based on action type
        const emailData =
          actionType === 'approve'
            ? {
              to: selectedRegistration.email,
              subject: 'Hari Om 🌼 – Your Appointment with Swami Ji is Confirmed',
              text: `Hari Om, ${selectedRegistration.name} 🙏

With the divine blessings of Pujya Swami Avdheshanand Giri Ji Maharaj, your appointment request has been confirmed.

✨ "गुरु के पावन सान्निध्य में मौन भी वाणी बन जाता है और आत्मा जागृत हो उठती है।" ✨

We lovingly welcome you to receive guidance and blessings during Swami Ji's USA visit.

🪔 Confirmed Appointment Details
Purpose: ${formatPurpose(selectedRegistration.purpose)}

Confirmed Date: ${eventDate}

Confirmed Time: ${eventTime}

Location: ${eventLocation}

We humbly request you to:
Arrive 15 minutes early.

Maintain the sanctity of silence and devotion.

Carry this confirmation email for reference.

With Blessings of Swami Ji,
Seva Team – Avdheshanand Giri Mission

🌸 "The goal of life is not just to exist, but to elevate the soul and experience Ananda." – Swami Avdheshanand Giri Ji 🌸`,
              html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #fcfcfc;">
  <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f8f5ff;">
    <h1 style="color: #7e57c2; font-size: 24px; margin: 0;">🌼 Hari Om – Appointment Confirmed 🌼</h1>
  </div>
  
  <p style="font-size: 16px;">Hari Om, <strong>${selectedRegistration.name}</strong> 🙏</p>
  
  <p style="font-size: 16px;">With the divine blessings of Pujya Swami Avdheshanand Giri Ji Maharaj, your appointment request has been confirmed.</p>
  
  <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #faf8ff; font-style: italic;">
    <p style="color: #5d4777;">✨ "गुरु के पावन सान्निध्य में मौन भी वाणी बन जाता है और आत्मा जागृत हो उठती है।" ✨</p>
  </div>
  
  <p style="font-size: 16px;">We lovingly welcome you to receive guidance and blessings during Swami Ji's USA visit.</p>
  
  <div style="background-color: #f9f9fc; border-left: 4px solid #b388ff; padding: 15px, 0;">
    <h3 style="margin-top: 0; color: #5d4777;">🪔 Confirmed Appointment Details</h3>
    
    <p style="margin-bottom: 15px;"><strong>Purpose:</strong> ${formatPurpose(selectedRegistration.purpose)}</p>
    
    <p style="margin-bottom: 15px;"><strong>Confirmed Date:</strong> ${eventDate}</p>
    
    <p style="margin-bottom: 15px;"><strong>Confirmed Time:</strong> ${eventTime}</p>
    
    <p style="margin-bottom: 15px;"><strong>Location:</strong> ${eventLocation}</p>
  </div>
  
  <div style="background-color: #faf9f4; border-left: 4px solid #e9c46a; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5d4777;">We humbly request you to:</h3>
    
    <ul style="list-style-type: none; padding-left: 5px;">
      <li style="margin-bottom: 10px;">• Arrive 15 minutes early.</li>
      <li style="margin-bottom: 10px;">• Maintain the sanctity of silence and devotion.</li>
      <li style="margin-bottom: 10px;">• Carry this confirmation email for reference.</li>
    </ul>
  </div>
  
  <p style="font-size: 16px; margin-top: 25px;">With Blessings of Swami Ji,<br />Seva Team – Avdheshanand Giri Mission</p>
  
  <div style="text-align: center; margin-top: 30px; padding: 15px; border-top: 1px solid #eee; background-color: #f8f5ff; font-size: 14px; color: #5d4777; font-style: italic;">
    <p>🌸 "The goal of life is not just to exist, but to elevate the soul and experience Ananda." – Swami Avdheshanand Giri Ji 🌸</p>
  </div>
</div>
                `,
            }
            : {
              to: selectedRegistration.email,
              subject: 'Hari Om 🙏 – Update on Your Appointment Request',
              text: `Hari Om, ${selectedRegistration.name} 🙏

We express our heartfelt gratitude for your devotion and your request to meet Pujya Swami Avdheshanand Giri Ji Maharaj during his USA visit.

✨ "गुरु की कृपा अनेक रूपों में मिलती है; हर अवसर भी एक आशीर्वाद ही है।" ✨

Due to the large number of requests and Swami Ji's limited schedule, we are unable to confirm your requested time.

However, our seva team will gladly assist you in rescheduling for another available time or guiding you to attend Swami Ji's open discourses and blessings sessions.

🪔 Requested Appointment Details
Original Date: ${eventDate}

Original Time: ${eventTime}

Location: ${eventLocation}

Next Steps:
Our seva team will reach out to propose alternate available slots.

With Blessings of Swami Ji,
Seva Team – Avdheshanand Giri Mission

🌸 "Every moment is an opportunity to awaken, and every meeting with the Guru is eternal." – Swami Avdheshanand Giri Ji 🌸`,
              html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #fcfcfc;">
  <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f8f5ff;">
    <h1 style="color: #7e57c2; font-size: 24px; margin: 0;">🌼 Hari Om – Appointment Update 🌼</h1>
  </div>
  
  <p style="font-size: 16px;">Hari Om, <strong>${selectedRegistration.name}</strong> 🙏</p>
  
  <p style="font-size: 16px;">We express our heartfelt gratitude for your devotion and your request to meet Pujya Swami Avdheshanand Giri Ji Maharaj during his USA visit.</p>
  
  <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #faf8ff; font-style: italic;">
    <p style="color: #5d4777;">✨ "गुरु की कृपा अनेक रूपों में मिलती है; हर अवसर भी एक आशीर्वाद ही है।" ✨</p>
  </div>
  
  <p style="font-size: 16px;">Due to the large number of requests and Swami Ji's limited schedule, we are unable to confirm your requested time.</p>
  
  <p style="font-size: 16px;">However, our seva team will gladly assist you in rescheduling for another available time or guiding you to attend Swami Ji's open discourses and blessings sessions.</p>
  
  <div style="background-color: #f9f9fc; border-left: 4px solid #b388ff; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5d4777;">🪔 Requested Appointment Details</h3>
    
    <p style="margin-bottom: 15px;"><strong>Original Date:</strong> ${eventDate}</p>
    
    <p style="margin-bottom: 15px;"><strong>Original Time:</strong> ${eventTime}</p>
    
    <p style="margin-bottom: 15px;"><strong>Location:</strong> ${eventLocation}</p>
  </div>
  
  <div style="background-color: #faf9f4; border-left: 4px solid #e9c46a; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5d4777;">Next Steps:</h3>
    <p>Our seva team will reach out to propose alternate available slots.</p>
  </div>
  
  <p style="font-size: 16px; margin-top: 25px;">With Blessings of Swami Ji,<br />Seva Team – Avdheshanand Giri Mission</p>
  
  <div style="text-align: center; margin-top: 30px; padding: 15px; border-top: 1px solid #eee; background-color: #f8f5ff; font-size: 14px; color: #5d4777; font-style: italic;">
    <p>🌸 "Every moment is an opportunity to awaken, and every meeting with the Guru is eternal." – Swami Avdheshanand Giri Ji 🌸</p>
  </div>
</div>
                `,
            };

        // Send email via API endpoint
        const emailResponse = await axios.post('/api/sendemail', emailData);

        if (!emailResponse.data.success) {
          throw new Error(emailResponse.data.message || 'Failed to send email');
        }

        console.log(`Notification email sent to ${selectedRegistration.email}`);
      } catch (emailErr) {
        // Email sending failed, but the status update succeeded
        console.error('Failed to send notification email:', emailErr);

        // Show a warning toast that the email failed but the action succeeded
        toast.warning('Status updated, but email notification failed', {
          description: "The registration status was updated, but we couldn't send an email notification.",
        });
      }

      // Show success toast for the main action
      if (actionType === 'approve') {
        toast.success('Registration Approved', {
          description: `The registration request for ${selectedRegistration.name} has been approved.`,
        });
      } else {
        toast.error('Registration Rejected', {
          description: `The registration request for ${selectedRegistration.name} has been rejected.`,
        });
      }
    } catch (err) {
      console.error('Error updating registration:', err);

      // Axios error handling
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        toast.error('Action Failed', {
          description: errorMessage,
        });
      } else {
        toast.error('Action Failed', {
          description: 'Failed to update the registration. Please try again.',
        });
      }
    } finally {
      setActionDialogOpen(false);
      setSelectedRegistration(null);
      setActionType(null);
      setActionInProgress(false);
    }
  };

  const handleRefresh = () => {
    setUpdateLoading(true);
    fetchRegistrations().finally(() => {
      setUpdateLoading(false);
    });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const normalizedStatus = status.toUpperCase();

    switch (normalizedStatus) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/schedule-registrations">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to calendar</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Registrations for {formatDate(dateObj)}</h1>
            <p className="text-muted-foreground">
              {registrations.length} registration{registrations.length !== 1 && 's'} for this date.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Add CSV Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={isExporting || registrations.length === 0 || loading}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || updateLoading}
          >
            {updateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading registrations...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Error loading registrations</h3>
            <p className="text-muted-foreground text-center">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No registrations found</h3>
            <p className="text-muted-foreground">
              There are no registration requests for this date.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {registrations.map(registration => (
            <Card
              key={registration._id}
              className={
                registration.reschedule
                  ? 'border-purple-200 bg-purple-50/30'
                  : registration.status.toUpperCase() === 'APPROVED'
                    ? 'border-green-200 bg-green-50/30'
                    : registration.status.toUpperCase() === 'REJECTED'
                      ? 'border-red-200 bg-red-50/30'
                      : ''
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{registration.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {registration.reschedule && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Rescheduled
                      </Badge>
                    )}
                    {getStatusBadge(registration.status)}
                  </div>
                </div>
                <CardDescription>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    {registration?.requestedSchedule?.eventTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {registration.requestedSchedule.eventTime}
                        </span>
                      </div>
                    )}
                  </div>
                </CardDescription>

              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${registration.email}`} className="hover:underline">
                      {registration.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${registration.phone}`} className="hover:underline">
                      {registration.phone}
                    </a>
                  </div>
                  {registration.requestedSchedule.eventLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{registration.requestedSchedule.eventLocation}</span>
                    </div>
                  )}
                </div>

                {/* Display Rescheduled Date if available */}
                {registration.reschedule && (
                  <div className="bg-purple-100 p-3 rounded-md border border-purple-200">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-purple-800">
                      <CalendarRange className="h-4 w-4 mr-1 text-purple-700" />
                      Rescheduled Appointment
                    </h4>
                    <p className="text-purple-900 font-medium">
                      Original request was rescheduled to the current date.
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Rescheduled on: {formatDate(registration.rescheduleDate || new Date())}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-1">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPurpose(registration.purpose)}
                  </p>
                </div>

                {/* Display Preferred Time if available */}
                {registration.preferedTime && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Preferred Time</h4>
                    <p className="text-sm text-muted-foreground">{registration.preferedTime}</p>
                  </div>
                )}

                {registration.additionalInfo && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Additional Information</h4>
                    <p className="text-sm text-muted-foreground">{registration.additionalInfo}</p>
                  </div>
                )}

                {registration.requestedSchedule.eventDetails && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Event Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {registration.requestedSchedule.eventDetails}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {/* Add Reschedule Button for all statuses */}
                <Button
                  variant="outline"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => handleReschedule(registration)}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {registration.reschedule ? 'Reschedule Again' : 'Reschedule'}
                </Button>

                {registration.status.toUpperCase() === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleAction(registration, 'reject')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(registration, 'approve')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                {registration.status.toUpperCase() === 'APPROVED' && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleAction(registration, 'reject')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Approval
                  </Button>
                )}
                {registration.status.toUpperCase() === 'REJECTED' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(registration, 'approve')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Instead
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date for this appointment. The user will be notified about the change.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-center mb-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-4">
                <p className="text-sm text-blue-700">
                  <strong>Selected date:</strong> {formatDate(selectedDate)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
              disabled={isRescheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReschedule}
              disabled={!selectedDate || isRescheduling}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isRescheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Confirm Reschedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this registration request? The user will be notified about the approval.'
                : 'Are you sure you want to reject this registration request? The user will be notified about the rejection.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive text-destructive-foreground'
              }
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : actionType === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}