import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(
  request: NextRequest,
  { params }: { params: { widgetKey: string } }
) {
  try {
    const { widgetKey } = params;

    if (!widgetKey) {
      return NextResponse.json(
        { error: "Widget key is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Updating widget: ${widgetKey}`);

    // Get the FormData from the request
    const formData = await request.formData();

    // Log FormData contents for debugging
    console.log("[API] Update payload:");
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    // Forward the FormData to the backend
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${widgetKey}/`,
      {
        method: "PUT",
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
    console.log(`[API] Successfully updated widget: ${widgetKey}`);

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
  try {
    const { widgetKey } = params;

    if (!widgetKey) {
      return NextResponse.json(
        { error: "Widget key is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Deleting widget: ${widgetKey}`);

    // Delete widget from backend
    const response = await fetch(
      `${API_BASE_URL}/widgets/widget/${widgetKey}/delete/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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

    console.log(`[API] Successfully deleted widget: ${widgetKey}`);

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
