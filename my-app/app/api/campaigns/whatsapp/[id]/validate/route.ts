import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/validate
// Returns the canonical ValidationResult for the campaign.
// Always 200 (even when invalid) — the body's `valid` field carries the verdict.
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

    const body = await request.json().catch(() => ({}))

    const response = await fetch(`${BASE_URL}/broadcast/whatsapp/campaigns/${id}/validate/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error validating campaign", {
      error: error instanceof Error ? error.message : String(error),
      campaignId: id,
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
