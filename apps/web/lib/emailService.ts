import nodemailer from 'nodemailer';

// SMTP Transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'no-reply@sportora.com',
    pass: process.env.SMTP_PASS || 'mock_pass'
  }
});

// Email HTML Templates
export const emailTemplates = {
  welcome: (name: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff;">
      <h2 style="color: #38bdf8;">Welcome to Sportora, ${name}! 🏆</h2>
      <p>Your ultimate sports tournament ecosystem account is now active.</p>
      <p>Start discovering tournaments, building your team, or creating matches!</p>
    </div>
  `,

  registrationConfirmation: (userName: string, tournamentTitle: string, teamName: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff;">
      <h2 style="color: #4ade80;">Registration Confirmed! ⚽</h2>
      <p>Hi ${userName},</p>
      <p>Your team <strong>${teamName}</strong> has been successfully registered for <strong>${tournamentTitle}</strong>.</p>
      <p>Check the app for live match schedules and brackets.</p>
    </div>
  `,

  otpEmail: (otp: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff;">
      <h2 style="color: #f43f5e;">Sportora Verification Code 🔑</h2>
      <p>Your OTP code is: <strong style="font-size: 24px; color: #38bdf8;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `
};

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    // In development / fallback mode, log if no real SMTP keys
    if (!process.env.SMTP_USER) {
      console.log(`[MOCK EMAIL QUEUE] To: ${to} | Subject: ${subject}`);
      return { success: true, mocked: true };
    }

    const info = await transporter.sendMail({
      from: '"Sportora Platform" <no-reply@sportora.com>',
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Email Delivery Error:', err.message);
    return { success: false, error: err.message };
  }
}
