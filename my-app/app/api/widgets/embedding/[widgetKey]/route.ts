import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetKey: string } }
) {
  // Check authentication and get session token
  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get Clerk JWT token to forward to backend
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: "Unable to get authentication token" },
      { status: 401 }
    );
  }

  try {
    const { widgetKey } = params;

    if (!widgetKey) {
      return NextResponse.json(
        { error: "Widget key is required" },
        { status: 400 }
      );
    }

    // Fetch embedding code from backend with Authorization header
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${widgetKey}/embedding-code/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        cache: "no-store", // Disable Next.js fetch cache
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch embedding code: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(` Successfully fetched embedding code for widget`);

    // Return with no-cache headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[API] Error fetching embedding code:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
