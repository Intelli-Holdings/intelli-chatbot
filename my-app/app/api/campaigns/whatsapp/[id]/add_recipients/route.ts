import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/add_recipients - Add recipients to WhatsApp campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.organization_id) {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      )
    }

    // Validate at least one recipient type is provided
    if (!body.tag_ids && !body.contact_ids && !body.recipients) {
      return NextResponse.json(
        { error: "At least one of tag_ids, contact_ids, or recipients must be provided" },
        { status: 400 }
      )
    }

    // Validate that arrays are not empty if provided
    if (body.tag_ids && (!Array.isArray(body.tag_ids) || body.tag_ids.length === 0)) {
      return NextResponse.json(
        { error: "tag_ids must be a non-empty array" },
        { status: 400 }
      )
    }

    if (body.contact_ids && (!Array.isArray(body.contact_ids) || body.contact_ids.length === 0)) {
      return NextResponse.json(
        { error: "contact_ids must be a non-empty array" },
        { status: 400 }
      )
    }

    if (body.recipients && (!Array.isArray(body.recipients) || body.recipients.length === 0)) {
      return NextResponse.json(
        { error: "recipients must be a non-empty array" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/${params.id}/add_recipients/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { detail: errorText }
      }

      return NextResponse.json(
        { error: errorData.detail || errorData.message || errorData.error || "Failed to add recipients" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error adding recipients", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
