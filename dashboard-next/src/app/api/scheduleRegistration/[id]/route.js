import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration, { RegistrationStatus } from '@/models/ScheduleRegistration';
import mongoose from 'mongoose';
import { sendRegistrationLifecycleNotifications } from '@/lib/scheduleNotifications';

const ScheduleRegistrationModel = ScheduleRegistration;

async function parseUpdatePayload(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await req.json();
  }

  const formData = await req.formData();
  const payload = {};

  for (const [key, value] of formData.entries()) {
    payload[key] = value;
  }

  return payload;
}

// Get a single schedule registration by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration ID' },
        { status: 400 }
      );
    }
    
    const registration = await ScheduleRegistrationModel.findById(id);
    
    if (!registration || registration.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Registration fetched successfully', data: registration },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch registration', error: error.message },
      { status: 500 }
    );
  }
}

// Update a schedule registration by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration ID' },
        { status: 400 }
      );
    }
    
    // Check if registration exists
    const registration = await ScheduleRegistrationModel.findById(id);
    if (!registration || registration.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }
    
    const payload = await parseUpdatePayload(req);
    
    const updateData = {};
    
    // Handle status update
    if (payload.status) {
      const status = payload.status;
      if (Object.values(RegistrationStatus).includes(status)) {
        updateData.status = status;
        if (status === RegistrationStatus.APPROVED) {
          updateData.approvedAt = new Date();
          updateData.rejectedAt = undefined;
        }
        if (status === RegistrationStatus.REJECTED) {
          updateData.rejectedAt = new Date();
          updateData.approvedAt = undefined;
        }
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400 }
        );
      }
    }
    
    // Handle reschedule update
    if (payload.reschedule !== undefined) {
      const reschedule = payload.reschedule;
      updateData.reschedule = reschedule === true || reschedule === 'true';
      
      if (updateData.reschedule && payload.rescheduleDate) {
        try {
          const rescheduleDate = payload.rescheduleDate;
          // Validate date format
          const dateObj = new Date(rescheduleDate);
          
          if (isNaN(dateObj.getTime())) {
            return NextResponse.json(
              { success: false, message: 'Invalid reschedule date format' },
              { status: 400 }
            );
          }
          
          // Store the original reschedule date
          updateData.rescheduleDate = dateObj;
          
          // Also update the eventDate in requestedSchedule if provided
          if (payload['requestedSchedule[eventDate]'] || payload.requestedSchedule?.eventDate) {
            const newEventDateStr =
              payload['requestedSchedule[eventDate]'] || payload.requestedSchedule?.eventDate;
            const eventDateObj = new Date(newEventDateStr);
            
            if (isNaN(eventDateObj.getTime())) {
              // Throw an error to be caught by the catch block
              throw new Error('Invalid event date format for requestedSchedule');
            }
            
            // Use dot notation to update the nested field.
            // This is the safest way and works even if requestedSchedule doesn't exist.
            updateData['requestedSchedule.eventDate'] = eventDateObj;
          }
        } catch (error) {
          return NextResponse.json(
            { success: false, message: 'Invalid date format', error: error.message },
            { status: 400 }
          );
        }
      }
    }

    if (payload.assignedTo !== undefined) {
      updateData.assignedTo = payload.assignedTo || undefined;
    }

    if (payload.internalNotes !== undefined) {
      updateData.internalNotes = payload.internalNotes || undefined;
    }

    if (payload.userId !== undefined) {
      updateData.userId = payload.userId || undefined;
    }

    const requestedSchedulePatch = payload.requestedSchedule || {};
    const eventTime = payload['requestedSchedule[eventTime]'] || requestedSchedulePatch.eventTime;
    const eventLocation =
      payload['requestedSchedule[eventLocation]'] || requestedSchedulePatch.eventLocation;
    const eventDetails =
      payload['requestedSchedule[eventDetails]'] || requestedSchedulePatch.eventDetails;
    const baseLocation =
      payload['requestedSchedule[baseLocation]'] || requestedSchedulePatch.baseLocation;

    if (eventTime !== undefined) {
      updateData['requestedSchedule.eventTime'] = eventTime || undefined;
    }

    if (eventLocation !== undefined) {
      updateData['requestedSchedule.eventLocation'] = eventLocation || undefined;
    }

    if (eventDetails !== undefined) {
      updateData['requestedSchedule.eventDetails'] = eventDetails || undefined;
    }

    if (baseLocation !== undefined) {
      updateData['requestedSchedule.baseLocation'] = baseLocation || undefined;
    }

    if (payload.emailNotificationSentAt) {
      updateData.emailNotificationSentAt = new Date(payload.emailNotificationSentAt);
    }

    if (payload.whatsappNotificationSentAt) {
      updateData.whatsappNotificationSentAt = new Date(payload.whatsappNotificationSentAt);
    }

    if (payload.nextDayReminderSentAt) {
      updateData.nextDayReminderSentAt = new Date(payload.nextDayReminderSentAt);
    }

    if (payload.morningReminderSentAt) {
      updateData.morningReminderSentAt = new Date(payload.morningReminderSentAt);
    }
    
    // Update the registration
    const updatedRegistration = await ScheduleRegistrationModel.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return NextResponse.json(
        { success: false, message: 'Failed to update registration' },
        { status: 500 }
      );
    }
    
    if (payload.status === RegistrationStatus.APPROVED) {
      const results = await sendRegistrationLifecycleNotifications(updatedRegistration, 'approved');
      if (results.email) {
        updateData.emailNotificationSentAt = new Date();
      }
      if (results.whatsapp) {
        updateData.whatsappNotificationSentAt = new Date();
      }
      if (results.email || results.whatsapp) {
        await ScheduleRegistrationModel.findByIdAndUpdate(id, {
          $set: {
            ...(results.email ? { emailNotificationSentAt: new Date() } : {}),
            ...(results.whatsapp ? { whatsappNotificationSentAt: new Date() } : {}),
          },
        });
      }
    }

    if (payload.status === RegistrationStatus.REJECTED) {
      await sendRegistrationLifecycleNotifications(updatedRegistration, 'rejected');
    }

    if (updateData.reschedule) {
      await sendRegistrationLifecycleNotifications(updatedRegistration, 'rescheduled');
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration updated successfully', 
        data: updatedRegistration 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update registration', error: error.message },
      { status: 500 }
    );
  }
}

// Delete a schedule registration by ID (soft delete)
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid registration ID' },
        { status: 400 }
      );
    }
    
    // Soft delete by setting isDeleted flag
    const deletedRegistration = await ScheduleRegistrationModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    
    if (!deletedRegistration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Registration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete registration', error: error.message },
      { status: 500 }
    );
  }
}
