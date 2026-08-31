import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    const refreshToken =
      cookieStore.get("refreshToken")?.value;

    console.log("[AI AUTH DEBUG]", {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      apiUrl: API_URL,
    });

    const body = await req.json();

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt.trim()
        : "";

    const conversationId =
      typeof body?.conversationId === "string" &&
      body.conversationId.trim()
        ? body.conversationId.trim()
        : undefined;

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    const authResult = await authenticatedFetch(
      "/api/v1/ai/chat",
      accessToken,
      refreshToken,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          ...(conversationId
            ? { conversationId }
            : {}),
        }),
      }
    );

    const response = authResult.response;

    const data = await response.json();

    const result = NextResponse.json(data, {
      status: response.status,
    });

    /*
     * authenticatedFetch() may have refreshed the
     * access token using refreshToken.
     *
     * Persist the new access token in the browser cookie.
     */
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
  } catch (error: any) {
    console.error("Sportora AI proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to connect to Sportora AI.",
      },
      { status: 500 }
    );
  }
}
