import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL ||
  'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const accessToken =
      request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 },
      );
    }

    const query =
      request.nextUrl.searchParams.get('q')?.trim() ?? '';

    const response = await fetch(
      `${API_URL}/api/v1/users/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search players.',
      },
      { status: 500 },
    );
  }
}
