import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Database';
import { authorize } from '@/lib/middleware';
import { dispatchNotification } from '@/lib/notificationQueue';

// GET: User In-App Notifications
export async function GET(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();
    const notifications = await Notification.find({ userId: auth.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ userId: auth.user.userId, isRead: false });

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Trigger Queued Notification & Email
export async function POST(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { title, message, type, recipientEmail } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Dispatch to Async Queue
    dispatchNotification({
      userId: auth.user.userId,
      email: recipientEmail || 'user@example.com',
      title,
      message,
      type: type || 'SYSTEM'
    });

    return NextResponse.json({
      success: true,
      message: 'Notification pushed to Async Queue for delivery!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Mark Notifications as Read
export async function PUT(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();
    await Notification.updateMany({ userId: auth.user.userId, isRead: false }, { isRead: true });

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
