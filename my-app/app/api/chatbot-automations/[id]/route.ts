import { NextRequest, NextResponse } from "next/server";
import { chatbotsStore } from "../_store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatbot = chatbotsStore.get(id);

    if (!chatbot) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    chatbotsStore.set(id, updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating chatbot:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!chatbotsStore.has(id)) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    chatbotsStore.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
