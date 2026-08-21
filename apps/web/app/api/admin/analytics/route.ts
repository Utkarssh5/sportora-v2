import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Tournament, Booking, VerificationRequest } from '@/models/Database';
import { authorize } from '@/lib/middleware';

export async function GET(req: Request) {
  const auth = authorize(req, ['admin', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();

    // 1. High-Level Summary Metrics
    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingVerifications = await VerificationRequest.countDocuments({ status: 'PENDING' });

    // Revenue Aggregation
    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: { _id: null, totalRevenue: { $sum: { $toDouble: "$amountPaid" } } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // 2. Role Breakdown
    const roleBreakdown = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 3. Sports Distribution (Chart Data)
    const sportsChartData = await Tournament.aggregate([
      { $group: { _id: "$sport", total: { $sum: 1 } } }
    ]);

    // 4. Monthly Signups Trend (Chart Data)
    const userGrowthChart = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers,
        totalTournaments,
        totalBookings,
        totalRevenue: `₹${totalRevenue.toLocaleString()}`,
        pendingVerifications
      },
      charts: {
        userGrowth: userGrowthChart.map(item => ({ date: item._id, count: item.newUsers })),
        sportsDistribution: sportsChartData.map(item => ({ sport: item._id, count: item.total })),
        roles: roleBreakdown.map(item => ({ role: item._id, count: item.count }))
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
