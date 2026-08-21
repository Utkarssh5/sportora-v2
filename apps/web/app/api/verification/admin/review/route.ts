import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { VerificationRequest, User } from '@/models/Database';
import { authorize } from '@/lib/middleware';

// GET: Admin Fetch All Pending Verification Requests
export async function GET(req: Request) {
  const auth = authorize(req, ['admin', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    await connectToDatabase();
    const requests = await VerificationRequest.find({ status: 'PENDING' })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Admin Approve or Reject Verification Request
export async function POST(req: Request) {
  const auth = authorize(req, ['admin', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { requestId, status, rejectionReason } = await req.json();

    if (!requestId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Valid Request ID and status (APPROVED or REJECTED) are required' 
      }, { status: 400 });
    }

    await connectToDatabase();
    const request = await VerificationRequest.findById(requestId);

    if (!request) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    request.status = status;
    request.rejectionReason = rejectionReason || '';
    request.reviewedAt = new Date();
    await request.save();

    // If APPROVED, update Organizer profile status in User collection
    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(request.userId, {
        'organizerProfile.isVerifiedOrganizer': true,
        'organizerProfile.organizationName': request.organizationName,
        'organizerProfile.gstNumber': request.gstNumber
      });
    }

    return NextResponse.json({
      success: true,
      message: `Organizer Verification Request ${status} successfully!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
