import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';


export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('accessToken')?.value;
    const refreshToken =
      cookieStore.get('refreshToken')?.value;

    const authResult = await authenticatedFetch(
      '/api/v1/users/me/performance',
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
            'Failed to fetch performance',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      performance: data.data,
    });

    if (authResult.refreshed) {
      result.cookies.set('accessToken', authResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
    }

    return result;
  } catch (error) {
    console.error('Performance proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
