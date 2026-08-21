import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      tournamentId: string;
    }>;
  },
) {
  try {
    const { tournamentId } = await context.params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const requirementId = searchParams.get('requirementId');

    const params = new URLSearchParams();

    if (requirementId) {
      params.set('requirementId', requirementId);
    }

    const query = params.toString();

    const response = await fetch(
      `${API_URL}/api/v1/tournament/${tournamentId}/crew-invitations${query ? `?${query}` : ''}`,
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
    console.error('Tournament crew invitations proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
