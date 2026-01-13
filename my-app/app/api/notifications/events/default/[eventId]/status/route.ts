import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { userId, getToken } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unable to get authentication token" }, { status: 401 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API base URL is not configured" }, { status: 500 });
  }

  const { eventId } = params;
  if (!eventId) {
    return NextResponse.json({ error: "Event id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const response = await fetch(
      `${API_BASE_URL}/notifications/events/default/${eventId}/status/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to update escalation event status", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error updating escalation event status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
