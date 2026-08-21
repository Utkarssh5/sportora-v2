import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Tournament, Booking } from '@/models/Database';
import { authorize } from '@/lib/middleware';

export async function GET(req: Request) {
  const auth = authorize(req, ['admin', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'users'; // 'users', 'tournaments', 'bookings'

    await connectToDatabase();

    let csvData = "";

    if (type === 'users') {
      const users = await User.find().select('-password').lean();
      csvData = "ID,Name,Email,Role,IsVerified,CreatedAt\n" + 
        users.map((u: any) => `"${u._id}","${u.name}","${u.email}","${u.role}","${u.isVerified}","${u.createdAt}"`).join("\n");
    } 
    else if (type === 'tournaments') {
      const tournaments = await Tournament.find().lean();
      csvData = "ID,Title,Sport,City,Venue,EntryFee,PrizePool,Status\n" + 
        tournaments.map((t: any) => `"${t._id}","${t.title}","${t.sport}","${t.city}","${t.venue}","${t.entryFee}","${t.prizePool}","${t.status}"`).join("\n");
    }
    else if (type === 'bookings') {
      const bookings = await Booking.find().lean();
      csvData = "BookingID,PlayerName,Phone,TeamName,AmountPaid,Status,TransactionID,CreatedAt\n" + 
        bookings.map((b: any) => `"${b._id}","${b.playerName}","${b.phone}","${b.teamName}","${b.amountPaid}","${b.paymentStatus}","${b.transactionId}","${b.createdAt}"`).join("\n");
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=sportora_${type}_report.csv`
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
