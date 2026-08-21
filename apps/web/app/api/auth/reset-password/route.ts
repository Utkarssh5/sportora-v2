import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, OTP } from '@/models/Database';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();

    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword, isVerified: true });
    await OTP.deleteMany({ email });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
