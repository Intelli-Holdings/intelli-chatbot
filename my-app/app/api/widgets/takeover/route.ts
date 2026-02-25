import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.visitor_id) {
      return NextResponse.json({ error: "Visitor ID is required" }, { status: 400 })
    }

    if (!body.action || !['takeover', 'handover'].includes(body.action)) {
      return NextResponse.json(
        { error: "Action must be 'takeover' or 'handover'" },
        { status: 400 }
      )
    }

    // Call backend endpoint
    const response = await fetch(`${BASE_URL}/widgets/take-or-hand-over-chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Chat takeover error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to process chat takeover" },
      { status: 500 }
    )
  }
}
