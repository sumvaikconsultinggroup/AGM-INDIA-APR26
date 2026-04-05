import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration, {
  MeetingPurpose,
  RegistrationStatus,
  PreferredTime,
} from '@/models/ScheduleRegistration';
import { sendEmail } from '@/utils/sendEmail';

// GET all registrations
export async function GET() {
  try {
    await connectDB();

    const registrations = await ScheduleRegistration.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    console.log('registrations', registrations);

    if (!registrations || registrations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No registrations found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Registrations fetched successfully', data: registrations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// POST - Create new registration
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();


    if (!formData) {
      return NextResponse.json({ success: false, message: 'No form data found' }, { status: 400 });
    }

    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const purpose = formData.get('purpose');
    const additionalInfo = formData.get('additionalInfo');
    const preferedTime = formData.get('preferredTime');

    const scheduleId = formData.get('requestedSchedule[scheduleId]');
    const scheduleDateStr = formData.get('requestedSchedule[eventDate]');
    const scheduleTime = formData.get('requestedSchedule[eventTime]');
    const scheduleLocation = formData.get('requestedSchedule[eventLocation]');
    const scheduleDetails = formData.get('requestedSchedule[eventDetails]');

    if (!name || !email || !phone || !purpose || !preferedTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, phone, purpose, and preferred time are required fields',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    const cleanPhone = phone.trim();

    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number must be 7–15 digits (optionally starting with +)',
        },
        { status: 400 }
      );
    }

    // Validate purpose enum
    if (!Object.values(MeetingPurpose).includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid purpose selected' },
        { status: 400 }
      );
    }

    // Validate preferred time enum
    if (!Object.values(PreferredTime).includes(preferedTime)) {
      return NextResponse.json(
        { success: false, message: 'Invalid preferred time selected' },
        { status: 400 }
      );
    }

    const registrationData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      purpose: purpose,
      preferedTime: preferedTime,
      status: RegistrationStatus.PENDING,
      isDeleted: false,
    };

    if (additionalInfo) {
      registrationData.additionalInfo = additionalInfo.trim();
    }

    if (scheduleId) {
      const requestedScheduleData = {
        scheduleId,
      };

if (scheduleDateStr) {
  let eventDate;

  if (scheduleDateStr.includes('T')) {
    // ISO datetime string
    eventDate = new Date(scheduleDateStr);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(scheduleDateStr)) {
    // YYYY-MM-DD format
    eventDate = new Date(`${scheduleDateStr}T00:00:00`);
  } else {
    // Human-readable string like "December 10, 2025"
    eventDate = new Date(scheduleDateStr);
  }

  if (isNaN(eventDate)) {
    return NextResponse.json(
      { success: false, message: 'Invalid date format for eventDate' },
      { status: 400 }
    );
  }

  requestedScheduleData.eventDate = eventDate;
}

      if (scheduleLocation) {
        requestedScheduleData.eventLocation = scheduleLocation.trim();
      }

      if (scheduleTime) {
        requestedScheduleData.eventTime = scheduleTime.trim();
      }

      if (scheduleDetails) {
        requestedScheduleData.eventDetails = scheduleDetails.trim();
      }

      registrationData.requestedSchedule = requestedScheduleData;
    }
    console.log(registrationData)
    const newRegistration = new ScheduleRegistration(registrationData);

    await newRegistration.validate();
    await newRegistration.save();

    const formatPurpose = purpose => {
      return purpose
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Format date for display
    const formatDate = dateString => {
      if (!dateString) return 'To be determined';
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    try {
      // Send confirmation email to the registrant
      const confirmationEmailSubject = 'Hari Om 🙏 – Your Appointment Request is Under Review';

      // Create plain text email content
      const confirmationEmailText = `
        Hari Om, ${registrationData.name} 🙏

        We have humbly received your request for an appointment with Pujya Swami Avdheshanand Giri Ji Maharaj during his upcoming USA visit.

        ✨ "जब श्रद्धा से शिष्य गुरु के चरणों में आता है, तो कृपा स्वतः प्रवाहित हो जाती है।" ✨

        Your request is currently pending review by our seva team. We will confirm your appointment or suggest an alternate time shortly.

        🪔 Appointment Request Details
        Purpose: ${formatPurpose(registrationData.purpose)}

        Preferred Time: ${registrationData.preferedTime}

        Status: 🕉 Pending Review

        ${
          scheduleDateStr
            ? `Requested Date: ${formatDate(new Date(scheduleDateStr))}
        `
            : ''
        }
        ${
          scheduleTime
            ? `Requested Time: ${scheduleTime}
        `
            : ''
        }
        ${
          scheduleLocation
            ? `Location: ${scheduleLocation}
        `
            : ''
        }
        ${additionalInfo ? `\nAdditional Information Provided:\n${additionalInfo}\n` : ''}

        With Blessings,
        Seva Team – Avdheshanand Giri Mission

        🌸 "Spirituality is not renunciation of life, it is the art of living life with wisdom and balance." – Swami Avdheshanand Giri Ji 🌸
      `;

      // Create HTML email content
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #fcfcfc;">
          <div style="text-align: center; margin-bottom: 20px; padding: 15px; background-color: #f8f5ff;">
            <h1 style="color: #7e57c2; font-size: 24px; margin: 0;">🌼 Hari Om – Appointment Request Received 🌼</h1>
          </div>
          
          <p style="font-size: 16px;">Hari Om, <strong>${registrationData.name}</strong> 🙏</p>
          
          <p style="font-size: 16px;">We have humbly received your request for an appointment with Pujya Swami Avdheshanand Giri Ji Maharaj during his upcoming USA visit.</p>
          
          <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #faf8ff; font-style: italic;">
            <p style="color: #5d4777;">✨ "जब श्रद्धा से शिष्य गुरु के चरणों में आता है, तो कृपा स्वतः प्रवाहित हो जाती है।" ✨</p>
          </div>
          
          <p style="font-size: 16px;">Your request is currently pending review by our seva team. We will confirm your appointment or suggest an alternate time shortly.</p>
          
          <div style="background-color: #f9f9fc; border-left: 4px solid #b388ff; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #5d4777;">🪔 Appointment Request Details</h3>
            
            <p style="margin-bottom: 15px;"><strong>Purpose:</strong> ${formatPurpose(registrationData.purpose)}</p>
            
            <p style="margin-bottom: 15px;"><strong>Preferred Time:</strong> ${registrationData.preferedTime}</p>
            
            <p style="margin-bottom: 15px;"><strong>Status:</strong> 🕉 Pending Review</p>
            
            ${scheduleDateStr ? `<p style="margin-bottom: 15px;"><strong>Requested Date:</strong> ${formatDate(new Date(scheduleDateStr))}</p>` : ''}
            
            ${scheduleTime ? `<p style="margin-bottom: 15px;"><strong>Requested Time:</strong> ${scheduleTime}</p>` : ''}
            
            ${scheduleLocation ? `<p style="margin-bottom: 15px;"><strong>Location:</strong> ${scheduleLocation}</p>` : ''}
            
            ${
              additionalInfo
                ? `
            <div style="margin-top: 15px;">
              <p><strong>Additional Information:</strong></p>
              <p style="font-style: italic;">"${additionalInfo}"</p>
            </div>`
                : ''
            }
          </div>
          
          <p style="font-size: 16px; margin-top: 25px;">With Blessings,<br />Seva Team – Avdheshanand Giri Mission</p>
          
          <div style="text-align: center; margin-top: 30px; padding: 15px; border-top: 1px solid #eee; background-color: #f8f5ff; font-size: 14px; color: #5d4777; font-style: italic;">
            <p>🌸 "Spirituality is not renunciation of life, it is the art of living life with wisdom and balance." – Swami Avdheshanand Giri Ji 🌸</p>
          </div>
        </div>
      `;

      // Send confirmation email
      await sendEmail(
        registrationData.email,
        confirmationEmailSubject,
        confirmationEmailText,
        confirmationEmailHtml
      );

      console.log('Confirmation email sent to registrant:', registrationData.email);

      // Send notification to admin
      const adminEmailSubject = 'New Appointment Request with Swami Ji';

      // Admin notification plain text
      const adminEmailText = `
        Hari Om 🙏
        
        A new appointment request has been submitted for Pujya Swami Avdheshanand Giri Ji Maharaj.
        
        Appointment Request Details:
        - Name: ${registrationData.name}
        - Email: ${registrationData.email}
        - Phone: ${registrationData.phone}
        - Purpose: ${formatPurpose(registrationData.purpose)}
        - Preferred Time: ${registrationData.preferedTime}
        ${scheduleDateStr ? `- Requested Date: ${formatDate(new Date(scheduleDateStr))}` : ''}
        ${scheduleTime ? `- Requested Time: ${scheduleTime}` : ''}
        ${scheduleLocation ? `- Location: ${scheduleLocation}` : ''}
        ${additionalInfo ? `\nAdditional Information:\n${additionalInfo}` : ''}
        
        Please login to the dashboard to review and respond to this appointment request.
        
        Hari Om 🙏
        Seva Team
      `;

      // Admin notification HTML
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #7e57c2;">New Appointment Request with Swami Ji</h1>
          </div>
          
          <p style="font-size: 16px;">Hari Om 🙏</p>
          
          <p>A new appointment request has been submitted for Pujya Swami Avdheshanand Giri Ji Maharaj.</p>
          
          <div style="background-color: #f9f9fc; border-left: 4px solid #b388ff; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #5d4777;">Appointment Request Details:</h3>
            <p><strong>Name:</strong> ${registrationData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${registrationData.email}" style="color: #7e57c2;">${registrationData.email}</a></p>
            <p><strong>Phone:</strong> ${registrationData.phone}</p>
            <p><strong>Purpose:</strong> ${formatPurpose(registrationData.purpose)}</p>
            <p><strong>Preferred Time:</strong> ${registrationData.preferedTime}</p>
            ${scheduleDateStr ? `<p><strong>Requested Date:</strong> ${formatDate(new Date(scheduleDateStr))}</p>` : ''}
            ${scheduleTime ? `<p><strong>Requested Time:</strong> ${scheduleTime}</p>` : ''}
            ${scheduleLocation ? `<p><strong>Location:</strong> ${scheduleLocation}</p>` : ''}
            
            ${
              additionalInfo
                ? `
            <div style="margin-top: 15px;">
              <p><strong>Additional Information:</strong></p>
              <p style="font-style: italic;">"${additionalInfo}"</p>
            </div>`
                : ''
            }
            
            <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/schedule-registrations" 
                style="display: inline-block; background-color: #7e57c2; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; margin-top: 10px;">
             Review in Dashboard
          </a></p>
          
          <p><a href="mailto:${registrationData.email}?subject=Re: Your Appointment Request with Swami Ji" 
                style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; 
                text-decoration: none; border-radius: 5px; margin-top: 10px;">
             Contact Devotee
          </a></p>
          
          <p style="margin-top: 25px;">Hari Om 🙏<br />Seva Team</p>
        </div>
      `;

      // Get admin email from environment variables
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

      if (adminEmail) {
        await sendEmail(adminEmail, adminEmailSubject, adminEmailText, adminEmailHtml);
        console.log('Notification email sent to admin:', adminEmail);
      } else {
        console.warn('Admin email not configured. Skipping admin notification.');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration created successfully',
        data: newRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration:', error);

    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create registration',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
