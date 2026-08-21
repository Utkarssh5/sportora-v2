import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const backendParams = new URLSearchParams();

    for (const param of ['q', 'city', 'state']) {
      const value = searchParams.get(param);

      if (value) {
        backendParams.set(param, value);
      }
    }

    const endpoint = searchParams.get('states')
      ? 'states'
      : searchParams.get('q')
        ? 'search'
        : searchParams.get('city')
          ? 'city'
          : 'state';

    const response = await fetch(
      `${API_URL}/api/v1/locations/${endpoint}?${backendParams.toString()}`,
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
            'Failed to fetch locations',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Location proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
