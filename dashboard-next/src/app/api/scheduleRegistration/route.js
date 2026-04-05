import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ScheduleRegistration, {
  MeetingPurpose,
  RegistrationStatus,
  PreferredTime,
} from '@/models/ScheduleRegistration';
import { Schedule } from '@/models/Schedule';
import { sendEmail } from '@/utils/sendEmail';

const ScheduleRegistrationModel = ScheduleRegistration;

function getSlotDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function deriveBaseLocation(schedule) {
  if (schedule?.baseLocation) return schedule.baseLocation;
  const locations = (schedule?.locations || '').toLowerCase();
  if (locations.includes('haridwar') || locations.includes('हरिद्वार')) return 'Haridwar Ashram';
  if (locations.includes('delhi') || locations.includes('दिल्ली')) return 'Delhi Ashram';
  return 'Other';
}

function formatPurpose(purpose) {
  return String(purpose || '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateString) {
  if (!dateString) return 'To be determined';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function parseRegistrationPayload(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    return {
      name: body.name,
      email: body.email,
      phone: body.phone,
      purpose: body.purpose,
      additionalInfo: body.additionalInfo,
      preferedTime: body.preferredTime || body.preferedTime,
      userId: body.userId,
      language: body.language,
      assignedTo: body.assignedTo,
      internalNotes: body.internalNotes,
      requestedSchedule: body.requestedSchedule || {
        scheduleId: body.scheduleId,
        eventDate: body.eventDate,
        eventTime: body.eventTime,
        eventLocation: body.eventLocation,
        eventDetails: body.eventDetails,
        baseLocation: body.baseLocation,
      },
    };
  }

  const formData = await req.formData();
  return {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    purpose: formData.get('purpose'),
    additionalInfo: formData.get('additionalInfo'),
    preferedTime: formData.get('preferredTime') || formData.get('preferedTime'),
    userId: formData.get('userId'),
    language: formData.get('language'),
    assignedTo: formData.get('assignedTo'),
    internalNotes: formData.get('internalNotes'),
    requestedSchedule: {
      scheduleId: formData.get('requestedSchedule[scheduleId]') || formData.get('scheduleId'),
      eventDate: formData.get('requestedSchedule[eventDate]') || formData.get('eventDate'),
      eventTime: formData.get('requestedSchedule[eventTime]') || formData.get('eventTime'),
      eventLocation:
        formData.get('requestedSchedule[eventLocation]') || formData.get('eventLocation'),
      eventDetails:
        formData.get('requestedSchedule[eventDetails]') || formData.get('eventDetails'),
      baseLocation:
        formData.get('requestedSchedule[baseLocation]') || formData.get('baseLocation'),
    },
  };
}

async function getCapacityState(scheduleId, eventDate) {
  if (!scheduleId || !eventDate) {
    return null;
  }

  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule || schedule.isDeleted) {
    return null;
  }

  const dateKey = getSlotDateKey(eventDate);
  const matchingSlot = (schedule.timeSlots || []).find(
    (slot) => getSlotDateKey(slot.startDate) === dateKey
  );

  const slotCapacity = matchingSlot?.slotCapacity || schedule.maxPeople || 100;
  const currentAppointments = await ScheduleRegistrationModel.countDocuments({
    isDeleted: { $ne: true },
    status: { $ne: RegistrationStatus.REJECTED },
    'requestedSchedule.scheduleId': String(scheduleId),
    'requestedSchedule.eventDate': {
      $gte: new Date(`${dateKey}T00:00:00.000Z`),
      $lt: new Date(`${dateKey}T23:59:59.999Z`),
    },
  });

  return {
    schedule,
    slotCapacity,
    currentAppointments,
    remainingCapacity: Math.max(slotCapacity - currentAppointments, 0),
    isBlocked: currentAppointments >= slotCapacity,
  };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const baseLocation = searchParams.get('baseLocation');
    const assignedTo = searchParams.get('assignedTo');
    const userId = searchParams.get('userId');
    const query = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (userId) {
      query.userId = userId;
    }

    if (baseLocation) {
      query['requestedSchedule.baseLocation'] = baseLocation;
    }

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      if (!Number.isNaN(start.getTime())) {
        query['requestedSchedule.eventDate'] = { $gte: start, $lte: end };
      }
    }

    const registrations = await ScheduleRegistrationModel.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        message: registrations.length ? 'Registrations fetched successfully' : 'No registrations found',
        data: registrations,
      },
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

export async function POST(req) {
  try {
    await connectDB();

    const payload = await parseRegistrationPayload(req);
    const {
      name,
      email,
      phone,
      purpose,
      additionalInfo,
      preferedTime,
      userId,
      language,
      assignedTo,
      internalNotes,
      requestedSchedule,
    } = payload;

    if (!name || !email || !phone || !purpose || !preferedTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, phone, purpose, and preferred time are required fields',
        },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    const cleanPhone = String(phone).trim();
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number must be 7–20 characters and can include +, -, spaces, and parentheses',
        },
        { status: 400 }
      );
    }

    if (!Object.values(MeetingPurpose).includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid purpose selected' },
        { status: 400 }
      );
    }

    if (!Object.values(PreferredTime).includes(preferedTime)) {
      return NextResponse.json(
        { success: false, message: 'Invalid preferred time selected' },
        { status: 400 }
      );
    }

    const requestedScheduleData = {};
    let scheduleForNotification = null;

    if (requestedSchedule?.scheduleId) {
      requestedScheduleData.scheduleId = String(requestedSchedule.scheduleId);
    }

    if (requestedSchedule?.eventDate) {
      const eventDate = new Date(requestedSchedule.eventDate);
      if (Number.isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid date format for eventDate' },
          { status: 400 }
        );
      }
      requestedScheduleData.eventDate = eventDate;
    }

    if (requestedScheduleData.scheduleId && requestedScheduleData.eventDate) {
      const capacityState = await getCapacityState(
        requestedScheduleData.scheduleId,
        requestedScheduleData.eventDate
      );

      if (!capacityState) {
        return NextResponse.json(
          { success: false, message: 'Schedule not found for this appointment request' },
          { status: 404 }
        );
      }

      if (capacityState.isBlocked) {
        return NextResponse.json(
          {
            success: false,
            message: 'This day is fully booked. Please choose another available schedule date.',
          },
          { status: 409 }
        );
      }

      scheduleForNotification = capacityState.schedule;
      requestedScheduleData.baseLocation =
        requestedSchedule?.baseLocation || deriveBaseLocation(capacityState.schedule);
      requestedScheduleData.eventLocation =
        requestedSchedule?.eventLocation ||
        capacityState.schedule.publicLocation?.en ||
        capacityState.schedule.publicLocation?.hi ||
        capacityState.schedule.locations;
    } else if (requestedSchedule?.eventLocation) {
      requestedScheduleData.eventLocation = String(requestedSchedule.eventLocation).trim();
    }

    if (requestedSchedule?.eventTime) {
      requestedScheduleData.eventTime = String(requestedSchedule.eventTime).trim();
    }

    if (requestedSchedule?.eventDetails) {
      requestedScheduleData.eventDetails = String(requestedSchedule.eventDetails).trim();
    }

    if (requestedSchedule?.baseLocation && !requestedScheduleData.baseLocation) {
      requestedScheduleData.baseLocation = String(requestedSchedule.baseLocation).trim();
    }

    const registrationData = {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: cleanPhone,
      purpose,
      additionalInfo: additionalInfo ? String(additionalInfo).trim() : undefined,
      preferedTime,
      userId: userId ? String(userId).trim() : undefined,
      language: language ? String(language).trim() : 'en',
      assignedTo: assignedTo ? String(assignedTo).trim() : undefined,
      internalNotes: internalNotes ? String(internalNotes).trim() : undefined,
      status: RegistrationStatus.PENDING,
      isDeleted: false,
      requestedSchedule: Object.keys(requestedScheduleData).length ? requestedScheduleData : undefined,
    };

    const newRegistration = new ScheduleRegistration(registrationData);
    await newRegistration.validate();
    await newRegistration.save();

    try {
      const location = registrationData.requestedSchedule?.eventLocation || 'the selected location';
      const eventDate = registrationData.requestedSchedule?.eventDate
        ? formatDate(registrationData.requestedSchedule.eventDate)
        : 'the selected date';
      const eventTime = registrationData.requestedSchedule?.eventTime || 'to be confirmed';
      const baseLocation = registrationData.requestedSchedule?.baseLocation || 'Ashram';
      const title =
        scheduleForNotification?.publicTitle?.en ||
        scheduleForNotification?.publicTitle?.hi ||
        scheduleForNotification?.locations ||
        'Swami Ji appointment';

      const confirmationEmailSubject = 'Hari Om 🙏 Your appointment request is under review';
      const confirmationEmailText = `
Hari Om, ${registrationData.name} 🙏

We have received your request to meet Pujya Swami Avdheshanand Giri Ji Maharaj.

Request summary:
- Schedule: ${title}
- Base: ${baseLocation}
- Date: ${eventDate}
- Time: ${eventTime}
- Location: ${location}
- Purpose: ${formatPurpose(registrationData.purpose)}

Your request is now with the seva team for approval. You will receive confirmation once the team assigns the final meeting time and venue.
      `;

      const confirmationEmailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #7e57c2;">Hari Om 🙏 Appointment Request Received</h1>
  <p>Hari Om, <strong>${registrationData.name}</strong></p>
  <p>We have received your request to meet Pujya Swami Avdheshanand Giri Ji Maharaj.</p>
  <div style="background: #faf8ff; border-left: 4px solid #b388ff; padding: 16px; margin: 20px 0;">
    <p><strong>Schedule:</strong> ${title}</p>
    <p><strong>Base:</strong> ${baseLocation}</p>
    <p><strong>Date:</strong> ${eventDate}</p>
    <p><strong>Time:</strong> ${eventTime}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Purpose:</strong> ${formatPurpose(registrationData.purpose)}</p>
  </div>
  <p>Your request is under review. After approval, our team will automatically send the confirmed meeting time and location by email and WhatsApp.</p>
</div>
      `;

      await sendEmail(
        registrationData.email,
        confirmationEmailSubject,
        confirmationEmailText,
        confirmationEmailHtml
      );
    } catch (emailError) {
      console.error('Failed to send registration confirmation email:', emailError);
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
    return NextResponse.json(
      { success: false, message: 'Failed to create registration', error: error.message },
      { status: 500 }
    );
  }
}
