import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
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
    // Get the FormData from the request
    const formData = await request.formData();

    // Validate required fields
    const requiredFields = ["organization_id", "assistant_id", "website_url", "widget_name"];
    for (const field of requiredFields) {
      if (!formData.has(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Forward the FormData to the backend with Authorization header
    const response = await fetch(`${API_BASE_URL}/widgets/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to create widget: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}