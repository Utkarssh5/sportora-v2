import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('adminAccessToken')?.value;
    const refreshToken = cookieStore.get('adminRefreshToken')?.value;

    const authResult = await authenticatedFetch(
      `/api/v1/tournament/${id}/approve`,
      accessToken,
      refreshToken,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    const response = authResult.response;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Failed to approve tournament.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      message: data.message || 'Tournament approved successfully.',
      data: data.data,
    });

    if (authResult.refreshed) {
      result.cookies.set('adminAccessToken', authResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
    }

    return result;
  } catch (error) {
    console.error('Admin tournament approval proxy error:', error);

    return NextResponse.json(
      { success: false, error: 'Unable to connect to Sportora API' },
      { status: 500 },
    );
  }
}
