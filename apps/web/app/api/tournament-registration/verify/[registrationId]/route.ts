import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  try {
    const { registrationId } = await params;

    const response = await fetch(
      `${API_URL}/api/v1/tournament-registration/verify/${registrationId}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(
      'Registration verification proxy error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
