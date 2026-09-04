import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${API_URL}/api/v1/auth/otp/login/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    const result = NextResponse.json(data, {
      status: response.status,
    });

    const accessToken = data?.data?.accessToken;

    if (accessToken) {
      result.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
    }

    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      const refreshTokenMatch =
        setCookie.match(/refreshToken=([^;]+)/);

      if (refreshTokenMatch?.[1]) {
        result.cookies.set('refreshToken', refreshTokenMatch[1], {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return result;
  } catch (error) {
    console.error(
      'OTP proxy error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
