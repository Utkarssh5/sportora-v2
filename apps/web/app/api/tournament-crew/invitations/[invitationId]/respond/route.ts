import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      invitationId: string;
    }>;
  },
) {
  try {
    const { invitationId } = await context.params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await req.json();

    const response = await fetch(
      `${API_URL}/api/v1/tournament/crew-invitations/${invitationId}/respond`,
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

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Crew invitation response proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
