import { NextResponse } from 'next/server';

const API_URL =
  process.env.SPORTORA_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: body.fullName,
        email: body.email,
        password: body.password,
        phone: body.phone || undefined,
        role: body.role || 'PLAYER',

        ...(body.role === 'ORGANIZER'
          ? {
              organizationName: body.organizationName,
              governmentIdType: body.governmentIdType,
              governmentId: body.governmentId,
              documentUrl: body.documentUrl,
              address: body.address,
              city: body.city,
              state: body.state,
              pincode: body.pincode,
            }
          : {}),
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Registration failed',
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'User registered successfully',
        user: data.data,
      },
      { status: response.status },
    );
  } catch (error) {
    console.error('Signup proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Sportora API',
      },
      { status: 500 },
    );
  }
}
