import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Database';
import { authorize } from '@/lib/middleware';

export async function GET(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId).populate('tournamentId');

    if (!booking) {
      return NextResponse.json({ error: 'Invoice/Booking not found' }, { status: 404 });
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; }
          .invoice-card { border: 1px solid #334155; padding: 25px; border-radius: 12px; background: #1e293b; max-width: 600px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #38bdf8; padding-bottom: 15px; }
          .title { color: #38bdf8; margin: 0; }
          .details { margin-top: 20px; line-height: 1.8; }
          .amount { font-size: 22px; color: #4ade80; font-weight: bold; margin-top: 15px; }
          .footer { margin-top: 25px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <h2 class="title">SPORTORA V2</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Official Payment Receipt</p>
            </div>
            <div style="text-align: right;">
              <p style="margin:0;">Invoice #: INV-${booking._id.toString().slice(-6)}</p>
              <p style="margin:0; font-size: 12px;">Date: ${new Date(booking.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="details">
            <p><strong>Player Name:</strong> ${booking.playerName}</p>
            <p><strong>Team Name:</strong> ${booking.teamName}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
            <p><strong>Status:</strong> <span style="color: #4ade80;">${booking.paymentStatus}</span></p>
            <div class="amount">Total Amount Paid: ₹${booking.amountPaid}</div>
          </div>
          <div class="footer">
            <p>Thank you for participating! Present this receipt at the venue for entry.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(invoiceHTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
