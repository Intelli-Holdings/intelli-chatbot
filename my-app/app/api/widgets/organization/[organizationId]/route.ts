import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // Check authentication and get session token
  const { userId, getToken } = auth();

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
    const { organizationId } = params;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Fetch widgets from backend with cache-busting and Authorization header
    const response = await fetch(
      `${API_BASE_URL}/widgets/organization/${organizationId}/all/`,
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
        { error: `Failed to fetch widgets: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return with no-cache headers to prevent stale data
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[API] Error fetching widgets:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
