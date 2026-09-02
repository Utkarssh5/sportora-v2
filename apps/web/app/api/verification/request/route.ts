import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const body = await request.json();

    const authResult = await authenticatedFetch(
      '/api/v1/verification/request',
      accessToken,
      refreshToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
            'Failed to submit organizer verification.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json(
      {
        success: true,
        data: data.data,
        message:
          data.message ||
          'Organizer verification request submitted successfully.',
      },
      { status: response.status },
    );

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
    console.error('Organizer verification request proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to submit organizer verification.',
      },
      { status: 500 },
    );
  }
}
