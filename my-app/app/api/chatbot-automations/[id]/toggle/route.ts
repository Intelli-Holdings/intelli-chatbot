import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { chatbotsStore } from "../../_store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = chatbotsStore.get(id);

    if (!existing) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    const updated = {
      ...existing,
      isActive: body.isActive,
      updatedAt: new Date().toISOString(),
    };

    chatbotsStore.set(id, updated);

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Error toggling chatbot", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
