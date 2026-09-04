import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('adminAccessToken')?.value;
    const refreshToken = cookieStore.get('adminRefreshToken')?.value;

    const authResult = await authenticatedFetch(
      '/api/v1/tournament/?page=1&limit=100',
      accessToken,
      refreshToken,
      { method: 'GET' },
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
            'Failed to fetch tournaments.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      data: data.tournaments ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 100,
      totalPages: data.totalPages ?? 1,
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
    console.error('Admin tournament list proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
