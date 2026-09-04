import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please login first',
        },
        { status: 401 },
      );
    }

    const body = await req.json();
    const tournamentId = body?.tournamentId;

    if (!tournamentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tournament ID is required',
        },
        { status: 400 },
      );
    }

    const { response, accessToken: activeAccessToken, refreshed } =
      await authenticatedFetch(
        '/api/v1/payment/create-order',
        accessToken,
        refreshToken,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tournamentId,
          }),
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
            'Payment order creation failed',
        },
        { status: response.status },
      );
    }

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    if (refreshed && activeAccessToken) {
      nextResponse.cookies.set('accessToken', activeAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Payment create-order proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
