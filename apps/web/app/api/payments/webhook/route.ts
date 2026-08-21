import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Database';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret_123';

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Invalid Webhook Signature' }, { status: 400 });
      }
    }

    const eventPayload = JSON.parse(rawBody);

    if (eventPayload.event === 'payment.captured') {
      const payment = eventPayload.payload.payment.entity;
      await connectToDatabase();

      // Update booking status asynchronously
      await Booking.findOneAndUpdate(
        { transactionId: payment.id },
        { paymentStatus: 'COMPLETED' }
      );
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
