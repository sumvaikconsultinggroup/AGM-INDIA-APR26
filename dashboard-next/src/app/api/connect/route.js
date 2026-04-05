import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Connect from '@/models/Connect';
import { sendEmail } from '@/utils/sendEmail';

// GET all contact submissions
export async function GET() {
  try {
    await connectDB();

    const submissions = await Connect.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No contact submissions found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact submissions retrieved successfully',
        data: submissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching contact submissions:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve contact submissions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST new contact submission
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json({ success: false, message: 'No form data found' }, { status: 400 });
    }

    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: fullName, email, subject, and message are required',
        },
        { status: 400 }
      );
    }

    const newSubmission = await Connect.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    try {
      // Send confirmation email to the person who submitted the form
      const confirmationEmailSubject = "We've Received Your Message";

      // Plain text version
      const confirmationEmailText = `
        Dear ${fullName},
        
        Thank you for reaching out to us. We have received your message and will get back to you shortly.
        
        Here's a summary of your submission:
        
        Subject: ${subject}
        Message: ${message}
        
        We appreciate your interest and will respond to your inquiry as soon as possible.
        
        Warm regards,
        The Team
      `;

      // HTML version
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f6df5;">Message Received</h1>
          </div>
          
          <p>Dear <strong>${fullName}</strong>,</p>
          
          <p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p>
          
          <div style="background-color: #f7f9fc; border-left: 4px solid #4f6df5; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          
          <p>We appreciate your interest and will respond to your inquiry as soon as possible.</p>
          
          <p>Warm regards,<br />The Team</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>This is an automated confirmation of your message submission.</p>
          </div>
        </div>
      `;

      // Send confirmation email
      await sendEmail(
        email,
        confirmationEmailSubject,
        confirmationEmailText,
        confirmationEmailHtml
      );
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact submission created successfully',
        data: newSubmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact submission:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
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
        message: 'Failed to create contact submission',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
