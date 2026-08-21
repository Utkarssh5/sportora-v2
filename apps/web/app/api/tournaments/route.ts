import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const backendParams = new URLSearchParams();

    const allowedParams = [
      'page',
      'limit',
      'search',
      'city',
      'sport',
      'state',
      'competitionType',
      'format',
      'status',
      'startDateFrom',
      'startDateTo',
      'minEntryFee',
      'maxEntryFee',
    ];

    for (const param of allowedParams) {
      const value = searchParams.get(param);

      if (value) {
        backendParams.set(param, value);
      }
    }

    const response = await fetch(
      `${API_URL}/api/v1/tournament/?${backendParams.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
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
            'Failed to fetch tournaments',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Tournament proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please login first',
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    const response = await fetch(
      `${API_URL}/api/v1/tournament/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
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
            'Failed to create tournament',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Tournament create proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
