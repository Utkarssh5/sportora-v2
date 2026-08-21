import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL ||
  'http://localhost:5000';

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ registrationId: string }>;
  },
) {
  try {
    const { registrationId } = await context.params;

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

    const body = await request.json();

    const response = await fetch(
      `${API_URL}/api/v1/competition-entry/registration/${registrationId}/draft`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
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
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to save participation draft.',
      },
      { status: 500 },
    );
  }
}
