import nodemailer from 'nodemailer';
import type { InsertContactSubmission } from '@shared/schema';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function sendContactEmail(contactData: InsertContactSubmission) {
  const { firstName, lastName, email, subject, message } = contactData;
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@davefrost.co.uk';
  
  // Email to admin
  const adminEmailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@davefrost.co.uk',
    to: adminEmail,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  // Confirmation email to user
  const userEmailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@davefrost.co.uk',
    to: email,
    subject: 'Thank you for contacting Adventures on Wheels',
    html: `
      <h2>Thank you for your message!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p>Best regards,<br>Adventures on Wheels Team</p>
    `,
  };

  try {
    // Send both emails
    await Promise.all([
      transporter.sendMail(adminEmailOptions),
      transporter.sendMail(userEmailOptions),
    ]);
    
    console.log('Contact emails sent successfully');
  } catch (error) {
    console.error('Error sending contact emails:', error);
    throw error;
  }
}
