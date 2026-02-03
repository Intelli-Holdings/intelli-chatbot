import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params;
  const { userId, orgId: authOrgId, getToken } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (authOrgId && authOrgId !== organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unable to get authentication token" }, { status: 401 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API base URL is not configured" }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const response = await fetch(
      `${API_BASE_URL}/notifications/events/${organizationId}/${queryString ? `?${queryString}` : ""}`,
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
        { error: "Failed to fetch escalation events", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching escalation events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
