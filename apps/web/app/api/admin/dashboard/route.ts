import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Tournament, Booking } from '@/models/Database';
import { authorize } from '@/lib/middleware';

export async function GET(req: Request) {
  const auth = authorize(req, ['admin']);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    const totalBookings = await Booking.countDocuments();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTournaments,
        totalBookings,
        systemHealth: '100% OPERATIONAL',
        database: 'MongoDB Atlas Connected'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
