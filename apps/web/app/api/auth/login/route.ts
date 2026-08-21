import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Login failed',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      user: data.data.user,
    });

    result.cookies.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      const refreshTokenMatch =
        setCookie.match(/refreshToken=([^;]+)/);

      if (refreshTokenMatch?.[1]) {
        result.cookies.set(
          'refreshToken',
          refreshTokenMatch[1],
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          },
        );
      }
    }

    return result;
  } catch (error) {
    console.error('Login proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
