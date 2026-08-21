import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken =
      cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refresh token missing',
        },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/auth/refresh`,
      {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data.message ||
            data.error ||
            'Token refresh failed',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      data: data.data,
    });

    result.cookies.set(
      'accessToken',
      data.data.accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      },
    );

    return result;
  } catch (error) {
    console.error('Refresh proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to refresh authentication',
      },
      { status: 500 },
    );
  }
}
