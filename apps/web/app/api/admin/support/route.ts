import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const url = new URL(req.url);
    const params = new URLSearchParams();

    for (const key of ['status', 'category', 'priority']) {
      const value = url.searchParams.get(key);

      if (value) {
        params.set(key, value);
      }
    }

    const query = params.toString();
    const apiPath = `/api/v1/support/admin${query ? `?${query}` : ''}`;

    const authResult = await authenticatedFetch(
      apiPath,
      accessToken,
      refreshToken,
      { method: 'GET' },
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
            'Failed to fetch support tickets.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      tickets: data.tickets ?? [],
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
    console.error('Admin support proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}


export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const url = new URL(req.url);
    const ticketId = url.searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Support ticket ID is required.',
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const authResult = await authenticatedFetch(
      `/api/v1/support/admin/${ticketId}`,
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
            'Failed to update support ticket.',
        },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      success: true,
      ticket: data.ticket,
      message: data.message || 'Support ticket updated successfully.',
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
    console.error('Admin support update proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
