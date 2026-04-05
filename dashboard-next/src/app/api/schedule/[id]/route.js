import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Schedule } from '@/models/Schedule';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/utils/sendEmail';

// Helper function to format date for display
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper for validation - updated for optional fields and maxPeople
const validatePartialScheduleUpdate = (data) => {
  const { timeSlots, maxPeople } = data;

  // Validate maxPeople if provided
  if (maxPeople !== undefined) {
    if (typeof maxPeople !== 'number') {
      return 'Maximum people must be a number';
    }
    
    if (maxPeople < 1) {
      return 'Maximum people must be at least 1';
    }
    
    if (maxPeople > 1000) {
      return 'Maximum people cannot exceed 1000';
    }
  }

  if (timeSlots) {
    for (const slot of timeSlots) {
      // Only startDate is required now
      if (!slot.startDate) {
        return 'Each time slot must include at least a startDate';
      }

      const start = new Date(slot.startDate);
      
      // Check if startDate is valid
      if (isNaN(start.getTime())) {
        return 'Invalid startDate format';
      }

      // Only validate endDate if it's provided
      if (slot.endDate) {
        const end = new Date(slot.endDate);

        if (isNaN(end.getTime())) {
          return 'Invalid endDate format';
        }

        if (start >= end) {
          return 'Time slot endDate must be after startDate';
        }
      }
    }
  }

  return null;
};

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await  params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Schedule ID',
        },
        { status: 400 }
      );
    }

    const deletedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedSchedule) {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule not found',
        },
        { status: 404 }
      );
    }

    // Send notification about schedule deletion
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      if (adminEmail) {
        const adminEmailSubject = `Schedule for ${deletedSchedule.month} Deleted`;
        
        const adminEmailText = `
          The schedule for ${deletedSchedule.month} has been deleted.
          
          Schedule Details:
          - Month: ${deletedSchedule.month}
          - Locations: ${deletedSchedule.locations}
          
          This schedule has been marked as deleted and will no longer appear in the public schedule listings.
        `;
        
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #e11d48;">Schedule Deleted</h1>
            </div>
            
            <p>The schedule for <strong>${deletedSchedule.month}</strong> has been deleted.</p>
            
            <div style="background-color: #fee2e2; border-left: 4px solid #e11d48; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Deleted Schedule Details:</h3>
              <p><strong>Month:</strong> ${deletedSchedule.month}</p>
              <p><strong>Locations:</strong> ${deletedSchedule.locations}</p>
              <p><strong>Deleted at:</strong> ${formatDate(new Date())}</p>
            </div>
            
            <p>This schedule has been marked as deleted and will no longer appear in the public schedule listings.</p>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/schedule" 
                  style="display: inline-block; background-color: #4f6df5; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; margin-top: 10px;">
               Manage Schedules
            </a></p>
          </div>
        `;
        
        await sendEmail(
          adminEmail,
          adminEmailSubject,
          adminEmailText,
          adminEmailHtml
        );
        console.log('Schedule deletion notification sent to admin:', adminEmail);
      }
    } catch (emailError) {
      console.error('Error sending schedule deletion notification:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule marked as deleted',
        data: deletedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Schedule soft delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to mark schedule as deleted',
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Schedule ID',
        },
        { status: 400 }
      );
    }

    // Get the original schedule to compare changes
    const originalSchedule = await Schedule.findById(id).lean();
    
    if (!originalSchedule) {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule not found',
        },
        { status: 404 }
      );
    }

    const data = await req.json();
    const validationError = validatePartialScheduleUpdate(data);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }
    
    // Format timeSlots if provided - handle the optional fields
    if (data.timeSlots) {
      data.timeSlots = data.timeSlots.map(slot => {
        const formattedSlot = {
          startDate: new Date(slot.startDate),
        };
        
        // Only add period if provided
        if (slot.period) {
          formattedSlot.period = slot.period;
        }
        
        // Only add endDate if provided
        if (slot.endDate) {
          formattedSlot.endDate = new Date(slot.endDate);
        }
        
        return formattedSlot;
      });
    }

    // Set default value for maxPeople if not provided but present in original
    if (data.maxPeople === undefined && originalSchedule.maxPeople) {
      data.maxPeople = originalSchedule.maxPeople;
    }

    // Set default value for appointment if not provided but present in original
    if (data.appointment === undefined && originalSchedule.appointment !== undefined) {
      data.appointment = originalSchedule.appointment;
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule not found',
        },
        { status: 404 }
      );
    }
    
    // Send notification about schedule update
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      if (adminEmail) {
        // Helper function to get earliest date from time slots
        function getEarliestDate(timeSlots) {
          if (!timeSlots || timeSlots.length === 0) return null;
          
          return timeSlots.reduce((earliest, slot) => {
            const date = new Date(slot.startDate);
            return !earliest || date < earliest ? date : earliest;
          }, null);
        }
        
        // Helper function to get latest date from time slots
        function getLatestDate(timeSlots) {
          if (!timeSlots || timeSlots.length === 0) return null;
          
          return timeSlots.reduce((latest, slot) => {
            // Use endDate if available, otherwise use startDate
            const date = slot.endDate ? new Date(slot.endDate) : new Date(slot.startDate);
            return !latest || date > latest ? date : latest;
          }, null);
        }
        
        const earliestDate = getEarliestDate(updatedSchedule.timeSlots);
        const latestDate = getLatestDate(updatedSchedule.timeSlots);
        
        // Create formatted schedule information for email
        const locationsList = updatedSchedule.locations.split(/[,\n]/)
          .map(loc => loc.trim())
          .filter(loc => loc)
          .join(', ');
          
        const timeSlotsText = updatedSchedule.timeSlots.length > 0
          ? updatedSchedule.timeSlots.map((slot, index) => {
              const periodText = slot.period ? `${slot.period}: ` : '';
              const startDateText = formatDate(slot.startDate);
              const endDateText = slot.endDate ? ` to ${formatDate(slot.endDate)}` : '';
              return `  ${index + 1}. ${periodText}${startDateText}${endDateText}`;
            }).join('\n')
          : '  No time slots defined';
        
        const adminEmailSubject = `Schedule for ${updatedSchedule.month} Updated`;
        
        const adminEmailText = `
          The schedule for ${updatedSchedule.month} has been updated.
          
          Updated Schedule Details:
          - Month: ${updatedSchedule.month}
          - Locations: ${locationsList}
          - Date Range: ${formatDate(earliestDate)} - ${formatDate(latestDate)}
          
          Time Slots:
${timeSlotsText}
          
          View and manage this schedule in the dashboard.
        `;
        
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4f6df5;">Schedule Updated</h1>
            </div>
            
            <p>The schedule for <strong>${updatedSchedule.month}</strong> has been updated.</p>
            
            <div style="background-color: #f7f9fc; border-left: 4px solid #4f6df5; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Updated Schedule Details:</h3>
              <p><strong>Month:</strong> ${updatedSchedule.month}</p>
              <p><strong>Locations:</strong> ${locationsList}</p>
              <p><strong>Date Range:</strong> ${formatDate(earliestDate)} - ${formatDate(latestDate)}</p>
              
              <div style="margin-top: 15px;">
                <p><strong>Time Slots:</strong></p>
                ${updatedSchedule.timeSlots.length > 0 
                  ? `<ol style="margin-top: 5px;">
                      ${updatedSchedule.timeSlots.map((slot) => {
                        const periodText = slot.period ? `<strong>${slot.period}:</strong> ` : '';
                        const startDateText = formatDate(slot.startDate);
                        const endDateText = slot.endDate ? ` to ${formatDate(slot.endDate)}` : '';
                        return `<li>${periodText}${startDateText}${endDateText}</li>`;
                      }).join('')}
                    </ol>`
                  : '<p>No time slots defined</p>'
                }
              </div>
            </div>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/schedule/${updatedSchedule._id}" 
                  style="display: inline-block; background-color: #4f6df5; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; margin-top: 10px;">
               View Updated Schedule
            </a></p>
          </div>
        `;
        
        await sendEmail(
          adminEmail,
          adminEmailSubject,
          adminEmailText,
          adminEmailHtml
        );
        console.log('Schedule update notification sent to admin:', adminEmail);
      }
    } catch (emailError) {
      console.error('Error sending schedule update notification:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update schedule',
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Schedule ID',
        },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule not found or has been deleted',
        },
        { status: 404 }
      );
    }
    
    // Process schedule with additional metadata
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    
    // Helper function to get earliest date from time slots
    function getEarliestDate(timeSlots) {
      if (!timeSlots || timeSlots.length === 0) return null;
      
      return timeSlots.reduce((earliest, slot) => {
        const date = new Date(slot.startDate);
        return !earliest || date < earliest ? date : earliest;
      }, null);
    }
    
    // Helper function to get latest date from time slots
    function getLatestDate(timeSlots) {
      if (!timeSlots || timeSlots.length === 0) return null;
      
      return timeSlots.reduce((latest, slot) => {
        // Use endDate if available, otherwise use startDate
        const date = slot.endDate ? new Date(slot.endDate) : new Date(slot.startDate);
        return !latest || date > latest ? date : latest;
      }, null);
    }
    
    const currentDate = new Date();
    const earliestStartDate = getEarliestDate(schedule.timeSlots);
    const latestEndDate = getLatestDate(schedule.timeSlots);
    
    // Ensure maxPeople has a default value if undefined
    const maxPeople = schedule.maxPeople !== undefined ? schedule.maxPeople : 100;
    
    const enhancedSchedule = {
      ...schedule,
      monthIndex: monthOrder.indexOf(schedule.month),
      earliestStartDate,
      latestEndDate,
      isUpcoming: earliestStartDate ? earliestStartDate >= currentDate : false,
      isPast: latestEndDate ? latestEndDate < currentDate : false,
      dateRange: `${formatDate(earliestStartDate)} - ${formatDate(latestEndDate)}`,
      maxPeople, // Ensure maxPeople is included with default value
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule fetched successfully',
        data: enhancedSchedule,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch schedule',
        error:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 }
    );
  }
}