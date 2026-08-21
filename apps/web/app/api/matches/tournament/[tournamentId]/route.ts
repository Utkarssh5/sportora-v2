import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ tournamentId: string }>;
  },
) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please login first',
        },
        { status: 401 },
      );
    }

    const { tournamentId } = await context.params;

    const response = await fetch(
      `${API_URL}/api/v1/match/tournament/${tournamentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
            'Failed to fetch tournament matches',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      'Tournament matches proxy error:',
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
