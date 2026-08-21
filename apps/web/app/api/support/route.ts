import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const body = await req.json();

    const authResult = await authenticatedFetch(
      "/api/v1/support",
      accessToken,
      refreshToken,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await authResult.response.json();

    const result = NextResponse.json(data, {
      status: authResult.response.status,
    });

    if (authResult.refreshed) {
      result.cookies.set("accessToken", authResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    }

    return result;
  } catch (error) {
    console.error("Support proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to Sportora API",
      },
      { status: 500 },
    );
  }
}


export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const authResult = await authenticatedFetch(
      "/api/v1/support/my",
      accessToken,
      refreshToken,
      {
        method: "GET",
      },
    );

    const data = await authResult.response.json();

    const result = NextResponse.json(data, {
      status: authResult.response.status,
    });

    if (authResult.refreshed) {
      result.cookies.set("accessToken", authResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    }

    return result;
  } catch (error) {
    console.error("Support tickets proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to Sportora API",
      },
      { status: 500 },
    );
  }
}
