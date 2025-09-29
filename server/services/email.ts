import nodemailer from 'nodemailer';
import type { InsertContactSubmission } from '@shared/schema';

// Configure nodemailer transporter for local postfix
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '25'),
  secure: false,
  // No authentication needed for local postfix
  ...(process.env.SMTP_USER && process.env.SMTP_PASS && {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }),
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

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const emailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@davefrost.co.uk',
    to: email,
    subject: 'Password Reset Request - Adventures on Wheels',
    html: `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password for Adventures on Wheels.</p>
      <p>Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Adventures on Wheels Team</p>
    `,
  };

  try {
    await transporter.sendMail(emailOptions);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
