import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// GET /api/campaigns/whatsapp/[id]/preview_messages - Preview messages for WhatsApp campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')
    const limit = searchParams.get('limit') || '5'

    if (!organization) {
      return NextResponse.json(
        { error: "organization parameter is required" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/${params.id}/preview_messages/?organization=${organization}&limit=${limit}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Failed to preview messages" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error previewing messages", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
