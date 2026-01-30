import { NextRequest, NextResponse } from "next/server";
import {
  ChatbotAutomation,
  DEFAULT_CHATBOT_SETTINGS,
  createDefaultMenu,
  generateId,
} from "@/types/chatbot-automation";
import { chatbotsStore } from "./_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const id = generateId();
    const now = new Date().toISOString();

    const chatbot: ChatbotAutomation = {
      id,
      organizationId: body.organizationId,
      appServiceId: body.appServiceId,
      channels: body.channels || [],
      name: body.name,
      description: body.description || "",
      isActive: body.isActive ?? false,
      priority: body.priority ?? 1,
      triggers: body.triggers || [],
      menus: body.menus || [createDefaultMenu(generateId(), "Main Menu")],
      settings: {
        ...DEFAULT_CHATBOT_SETTINGS,
        ...body.settings,
      },
      createdAt: now,
      updatedAt: now,
    };

    chatbotsStore.set(id, chatbot);

    return NextResponse.json(chatbot, { status: 201 });
  } catch (error) {
    console.error("Error creating chatbot:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const chatbots = Array.from(chatbotsStore.values());
    return NextResponse.json(chatbots);
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
