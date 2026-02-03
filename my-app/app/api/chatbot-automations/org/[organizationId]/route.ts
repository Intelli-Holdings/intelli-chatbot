import { NextRequest, NextResponse } from "next/server";

// Import the shared store - we need to use a different approach for shared state
// For now, re-import from the main route (this is a limitation of the in-memory approach)
import { chatbotsStore } from "../../_store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    const chatbots = Array.from(chatbotsStore.values()).filter(
      (chatbot) => chatbot.organizationId === organizationId
    );

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
