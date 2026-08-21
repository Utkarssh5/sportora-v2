import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      tournamentId: string;
      requirementId: string;
    }>;
  },
) {
  try {
    const { tournamentId, requirementId } =
      await context.params;

    const response = await fetch(
      `${API_URL}/api/v1/tournament/${tournamentId}/crew-requirements/${requirementId}/candidates`,
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
            'Failed to find crew candidates',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      'Crew candidate search proxy error:',
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
