import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

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

    const response = await fetch(
      `${API_URL}/api/v1/tournament-registration/${encodeURIComponent(
        tournamentId,
      )}/register`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
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
            'Tournament registration failed',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Tournament registration proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
