import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(
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
    const response = await fetch(`${API_BASE_URL}/notifications/events/${eventId}/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to delete escalation event", details: errorText },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting escalation event", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
