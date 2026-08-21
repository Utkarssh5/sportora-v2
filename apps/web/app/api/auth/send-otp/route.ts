import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OTP } from '@/models/Database';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    await connectToDatabase();
    await OTP.deleteMany({ email }); // Delete old OTPs
    await OTP.create({ email, otp: generatedOTP });

    // In production, send via AWS SES or Nodemailer
    return NextResponse.json({
      success: true,
      message: 'OTP generated and sent successfully!',
      debugOtp: generatedOTP // Returned for testing
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
