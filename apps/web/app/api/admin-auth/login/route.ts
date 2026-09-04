import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required.',
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || 'Invalid admin credentials.',
        },
        { status: response.status || 401 },
      );
    }

    const user = data?.data?.user;
    const accessToken = data?.data?.accessToken;

    if (!user || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login response.',
        },
        { status: 502 },
      );
    }

    if (user.role !== 'ADMIN') {
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
      message: 'Admin login successful.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });

    result.cookies.set('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const refreshTokenMatch = setCookie.match(/refreshToken=([^;]+)/);

      if (refreshTokenMatch?.[1]) {
        result.cookies.set('adminRefreshToken', refreshTokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return result;
  } catch (error) {
    console.error('Admin login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to process admin login.',
      },
      { status: 500 },
    );
  }
}
