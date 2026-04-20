import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/resume - Resume WhatsApp campaign execution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.organization_id) {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE_URL}/broadcast/whatsapp/campaigns/${id}/resume/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const rawText = await response.text()
      let errorData: any = {}

      try {
        errorData = JSON.parse(rawText)
      } catch {
        // Keep raw text as the last fallback.
      }

      const message =
        errorData.error ||
        errorData.detail ||
        errorData.message ||
        rawText ||
        "Failed to resume campaign"

      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    logger.error("Error resuming campaign", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
