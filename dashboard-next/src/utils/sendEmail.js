import nodemailer from 'nodemailer';
export async function sendEmail(to, subject, text, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV === 'development',
    });

    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
    });

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'SwamiG Dashboard',
        address: process.env.EMAIL_USER || '',
      },
      to,
      subject,
      text,
      ...(html && { html }), // Only include html if provided
    };

    console.log('Sending email to:', to);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
