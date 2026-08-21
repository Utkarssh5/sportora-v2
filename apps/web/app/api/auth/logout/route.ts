import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST() {
  try {
    const cookieStore = await cookies();

    const refreshToken =
      cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: 'no-store',
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout proxy error:', error);

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });

    return response;
  }
}
