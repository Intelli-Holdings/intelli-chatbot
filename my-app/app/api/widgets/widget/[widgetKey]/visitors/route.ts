import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetKey: string } }
) {
  const { userId, getToken } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unable to get authentication token" }, { status: 401 });
  }

  const { widgetKey } = params;
  if (!widgetKey) {
    return NextResponse.json({ error: "Widget key is required" }, { status: 400 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API base URL is not configured" }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${encodeURIComponent(widgetKey)}/visitors/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch widget visitors: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching widget visitors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
