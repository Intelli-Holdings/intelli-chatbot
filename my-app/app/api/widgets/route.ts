import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Creating new widget");

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

    // Log FormData contents for debugging
    console.log("[API] Widget creation payload:");
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    // Forward the FormData to the backend
    const response = await fetch(`${API_BASE_URL}/widgets/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to create widget: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API] Successfully created widget:", data.widget_key);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error creating widget:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}