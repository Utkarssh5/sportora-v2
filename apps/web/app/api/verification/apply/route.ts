import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { VerificationRequest } from '@/models/Database';
import { authorize } from '@/lib/middleware';

// POST: Submit Verification Documents
export async function POST(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { organizationName, panNumber, gstNumber, documentUrl } = await req.json();

    if (!organizationName || !panNumber || !documentUrl) {
      return NextResponse.json({ 
        error: 'Organization name, PAN number, and document URL are required' 
      }, { status: 400 });
    }

    await connectToDatabase();

    // Check if a request is already pending
    const existing = await VerificationRequest.findOne({ 
      userId: auth.user.userId, 
      status: 'PENDING' 
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'You already have a pending verification request under review.' 
      }, { status: 400 });
    }

    const request = await VerificationRequest.create({
      userId: auth.user.userId,
      organizationName,
      panNumber,
      gstNumber: gstNumber || '',
      documentUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully! Pending Admin Review.',
      request
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Check Verification Status for Current User
export async function GET(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();
    const status = await VerificationRequest.findOne({ userId: auth.user.userId }).sort({ submittedAt: -1 });

    return NextResponse.json({
      success: true,
      status: status || { status: 'NOT_SUBMITTED' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
