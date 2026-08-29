import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${API_URL}/api/v1/auth/otp/register/verify`,
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

    const result = NextResponse.json(
      data,
      { status: response.status },
    );

    const setCookie =
      response.headers.get('set-cookie');

    if (setCookie) {
      result.headers.set(
        'set-cookie',
        setCookie,
      );
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
