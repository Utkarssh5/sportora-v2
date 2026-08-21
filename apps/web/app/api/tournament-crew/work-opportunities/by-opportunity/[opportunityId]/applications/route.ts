import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ opportunityId: string }>;
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

    const { opportunityId } = await params;

    const response = await fetch(
      `${API_URL}/api/v1/tournament/crew-work-opportunities/${opportunityId}/applications`,
      {
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
    console.error(
      'Crew work applications proxy error:',
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
