import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  req: Request,
  context: {
    params: Promise<{ crewId: string }>;
  },
) {
  try {
    const { crewId } = await context.params;

    const response = await fetch(
      `${API_URL}/api/v1/crew/${crewId}/profile`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          cookie: req.headers.get('cookie') || '',
          authorization: req.headers.get('authorization') || '',
        },
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
            'Failed to fetch crew profile',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crew profile preview proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
