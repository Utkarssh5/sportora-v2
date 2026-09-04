import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('adminAccessToken')?.value;
    const refreshToken =
      cookieStore.get('adminRefreshToken')?.value;

    const authResult = await authenticatedFetch(
      '/api/v1/users/me',
      accessToken,
      refreshToken,
      {
        method: 'GET',
      },
    );

    const response = authResult.response;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data.message ||
            data.error ||
            'Failed to fetch admin profile',
        },
        { status: response.status },
      );
    }

    const profile = data?.data;

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'admin')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access is required.',
        },
        { status: 403 },
      );
    }

    const result = NextResponse.json({
      success: true,
      profile,
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
    console.error('Admin profile proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
