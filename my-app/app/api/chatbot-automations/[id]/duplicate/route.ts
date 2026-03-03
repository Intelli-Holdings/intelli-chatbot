import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { generateId } from "@/types/chatbot-automation";
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

    const newId = generateId();
    const now = new Date().toISOString();

    // Deep clone and update IDs
    const duplicated = {
      ...JSON.parse(JSON.stringify(existing)),
      id: newId,
      name: body.name || `${existing.name} (Copy)`,
      isActive: false,
      createdAt: now,
      updatedAt: now,
      // Generate new IDs for menus and triggers
      menus: existing.menus.map((menu) => ({
        ...menu,
        id: generateId(),
        options: menu.options.map((opt) => ({
          ...opt,
          id: generateId(),
        })),
      })),
      triggers: existing.triggers.map((trigger) => ({
        ...trigger,
        id: generateId(),
      })),
    };

    chatbotsStore.set(newId, duplicated);

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    logger.error("Error duplicating chatbot", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
