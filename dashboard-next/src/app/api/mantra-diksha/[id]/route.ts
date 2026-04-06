import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import MantraDiksha from '@/models/MantraDiksha';
import { sendEmail } from '@/utils/sendEmail';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function buildLifecycleMessage(registration: any, status: string) {
  if (status === 'approved') {
    return {
      subject: 'Hari Om - Your Mantra Diksha registration has been approved',
      text: `Hari Om ${registration.fullName},\n\nWith blessings, your Mantra Diksha registration has been approved.${registration.ceremonyDate ? `\nCeremony date: ${new Date(registration.ceremonyDate).toLocaleString('en-IN')}` : ''}\n\nAvdheshanandG Mission Team`,
    };
  }

  if (status === 'rejected') {
    return {
      subject: 'Hari Om - Update on your Mantra Diksha registration',
      text: `Hari Om ${registration.fullName},\n\nWith blessings, your Mantra Diksha registration could not be approved at this time. Our team may reach out separately if any clarification is needed.\n\nAvdheshanandG Mission Team`,
    };
  }

  return {
    subject: 'Hari Om - Your Mantra Diksha registration is under review',
    text: `Hari Om ${registration.fullName},\n\nYour Mantra Diksha registration is under review. Our team will connect with you soon.\n\nAvdheshanandG Mission Team`,
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid registration ID' }, { status: 400 });
    }

    const registration = await MantraDiksha.findOne({ _id: id, isDeleted: false }).lean();
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('GET Mantra Diksha registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch registration' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid registration ID' }, { status: 400 });
    }

    const body = await req.json();
    const nextStatus = body.status;
    const updateData: Record<string, unknown> = {
      ...(nextStatus && { status: nextStatus }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo || null }),
      ...(body.assignedToName !== undefined && { assignedToName: body.assignedToName || null }),
      ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes || null }),
      ...(body.ceremonyDate !== undefined && { ceremonyDate: body.ceremonyDate ? new Date(body.ceremonyDate) : null }),
      reviewedAt: new Date(),
      ...(nextStatus === 'approved' && { approvedAt: new Date() }),
      ...(nextStatus === 'rejected' && { rejectedAt: new Date() }),
    };

    const registration = await MantraDiksha.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    if (body.notifyApplicant && registration.email && nextStatus) {
      try {
        const message = buildLifecycleMessage(registration, nextStatus);
        await sendEmail(
          registration.email,
          message.subject,
          message.text,
          `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;"><h1 style="color:#7b1e1e;">Hari Om</h1><p>${message.text.replace(/\n/g, '<br />')}</p></div>`
        );
      } catch (error) {
        console.error('Failed to notify Mantra Diksha applicant:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
      data: registration,
    });
  } catch (error) {
    console.error('PUT Mantra Diksha registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid registration ID' }, { status: 400 });
    }

    const registration = await MantraDiksha.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();

    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
      data: registration,
    });
  } catch (error) {
    console.error('DELETE Mantra Diksha registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete registration' }, { status: 500 });
  }
}
