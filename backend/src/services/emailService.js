import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (transporter) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@eduverse.com',
      to,
      subject,
      html,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${to}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      return false;
    }
  } else {
    console.log('\n--- MOCK EMAIL OUTBOX ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Snippet: ${html.replace(/<[^>]*>/g, '').slice(0, 200)}...`);
    console.log('-------------------------\n');
    return true;
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Welcome to EduVerse, ${name}!</h2>
      <p>Thank you for registering. Please verify your email address to active your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Best regards,<br/>The EduVerse Team</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: 'Verify Your EduVerse Email', html });
};

export const sendResetPasswordEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This password reset link will expire in 1 hour.</p>
      <p>Best regards,<br/>The EduVerse Team</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: 'Reset Your EduVerse Password', html });
};
