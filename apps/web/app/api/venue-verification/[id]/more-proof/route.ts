import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const authResult = await authenticatedFetch(
      `/api/v1/venue-verification/${id}/more-proof`,
      accessToken,
      refreshToken,
      {
        method: 'PATCH',
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
            'Failed to request more proof.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      message: data.message || 'More proof requested.',
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
    console.error('Admin more-proof proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
