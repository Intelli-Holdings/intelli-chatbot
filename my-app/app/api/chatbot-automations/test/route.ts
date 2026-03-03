import { NextRequest, NextResponse } from "next/server";
import { ChatbotAutomationService } from "@/services/chatbot-automation";
import { logger } from "@/lib/logger";
import { chatbotsStore } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbotId, input, sessionId } = body;

    const chatbot = chatbotsStore.get(chatbotId);

    if (!chatbot) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    // Find matching menu by keyword
    const menu = ChatbotAutomationService.findMenuByKeyword(chatbot, input);

    if (menu) {
      return NextResponse.json({
        sessionId: sessionId || `session-${Date.now()}`,
        menu,
        message: menu.body,
        action: "show_menu",
        fallbackTriggered: false,
      });
    }

    // No match found, trigger fallback
    return NextResponse.json({
      sessionId: sessionId || `session-${Date.now()}`,
      menu: null,
      message: chatbot.settings.fallbackMessage,
      action: "fallback_ai",
      fallbackTriggered: true,
    });
  } catch (error) {
    logger.error("Error testing chatbot", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
