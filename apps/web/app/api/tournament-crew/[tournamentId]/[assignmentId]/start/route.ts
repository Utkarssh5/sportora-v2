import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

type RouteContext = {
  params: Promise<{
    tournamentId: string;
    assignmentId: string;
  }>;
};

export async function POST(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { tournamentId, assignmentId } =
      await context.params;

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

    const response = await fetch(
      `${API_URL}/api/v1/tournament/${tournamentId}/crew-assignments/${assignmentId}/start`,
      {
        method: 'POST',
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
            'Unable to start crew assignment',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crew assignment start proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
