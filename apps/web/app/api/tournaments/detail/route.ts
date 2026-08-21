import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Tournament } from '@/models/Database';
import { authorize } from '@/lib/middleware';

// UPDATE TOURNAMENT
export async function PUT(req: Request) {
  const auth = authorize(req, ['organizer', 'admin', 'ORGANIZER', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { id, ...updateData } = await req.json();
    if (!id) return NextResponse.json({ error: 'Tournament ID required' }, { status: 400 });

    await connectToDatabase();
    const updated = await Tournament.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return NextResponse.json({ success: true, message: 'Tournament updated!', tournament: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE TOURNAMENT
export async function DELETE(req: Request) {
  const auth = authorize(req, ['organizer', 'admin', 'ORGANIZER', 'ADMIN']);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Tournament ID required' }, { status: 400 });

    await connectToDatabase();
    await Tournament.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Tournament deleted successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
