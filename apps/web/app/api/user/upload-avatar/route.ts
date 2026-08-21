import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware';

export async function POST(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL or file data required' }, { status: 400 });
    }

    // Returns formatted avatar URL ready to be saved in database
    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully!',
      avatarUrl: imageUrl
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
