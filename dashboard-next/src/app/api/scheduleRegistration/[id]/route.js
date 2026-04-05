import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration, { RegistrationStatus } from '@/models/ScheduleRegistration';
import mongoose from 'mongoose';

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
    
    const registration = await ScheduleRegistration.findById(id);
    
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
    const registration = await ScheduleRegistration.findById(id);
    if (!registration || registration.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }
    
    const formData = await req.formData();
    
    const updateData = {};
    
    // Handle status update
    if (formData.has('status')) {
      const status = formData.get('status');
      if (Object.values(RegistrationStatus).includes(status)) {
        updateData.status = status;
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400 }
        );
      }
    }
    
    // Handle reschedule update
    if (formData.has('reschedule')) {
      const reschedule = formData.get('reschedule');
      updateData.reschedule = reschedule === 'true';
      
      if (updateData.reschedule && formData.has('rescheduleDate')) {
        try {
          const rescheduleDate = formData.get('rescheduleDate');
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
          if (formData.has('requestedSchedule[eventDate]')) {
            const newEventDateStr = formData.get('requestedSchedule[eventDate]');
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
    
    // Update the registration
    const updatedRegistration = await ScheduleRegistration.findByIdAndUpdate(
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
    const deletedRegistration = await ScheduleRegistration.findByIdAndUpdate(
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
