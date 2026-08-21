import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> },
) {
  try {
    const { tournamentId } = await params;
    const body = await request.json();

    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('accessToken')?.value;
    const refreshToken =
      cookieStore.get('refreshToken')?.value;

    const authResult = await authenticatedFetch(
      `/api/v1/venue-verification/tournament/${tournamentId}/submit`,
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
            'Failed to submit venue proof.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      message:
        data.message || 'Venue proof submitted for review.',
      data: data.data,
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
    console.error('Venue proof submit proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
