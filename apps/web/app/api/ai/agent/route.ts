import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.SPORTORA_API_URL || "http://localhost:5000";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

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

    const response = await fetch(
      `${API_URL}/api/v1/ai/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt,
          ...(conversationId
            ? { conversationId }
            : {}),
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error(
      "Sportora AI proxy error:",
      error
    );

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
