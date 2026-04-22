import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/cancel
// Transitions a sending Campaign to FAILED with failure_reason='cancelled_by_user'.
// The running Celery task polls Campaign.status and exits on its next iteration.
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

    const response = await fetch(`${BASE_URL}/broadcast/whatsapp/campaigns/${id}/cancel/`, {
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
    logger.error("Error cancelling campaign", {
      error: error instanceof Error ? error.message : String(error),
      campaignId: id,
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
