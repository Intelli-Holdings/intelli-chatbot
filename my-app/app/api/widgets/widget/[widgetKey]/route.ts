import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(
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

    // Get the FormData from the request
    const formData = await request.formData();

    // Forward the FormData to the backend with Authorization header
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${widgetKey}/`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to update widget: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[API] Successfully updated widget`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error updating widget:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    console.log(`[API] Deleting widget`);

    // Delete widget from backend with Authorization header
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${widgetKey}/delete/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to delete widget: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { success: true, message: "Widget deleted successfully" };
    }

    console.log(`[API] Successfully deleted widget`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error deleting widget:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
