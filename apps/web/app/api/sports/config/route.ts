import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/sports/config`,
      {
        cache: 'no-store',
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Sports config proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load sports configuration.',
      },
      { status: 500 },
    );
  }
}
