import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/execute - Execute WhatsApp campaign
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

    if (body.execute_now === undefined) {
      return NextResponse.json(
        { error: "execute_now field is required" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/${params.id}/execute/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      // Try to surface as much error detail as possible
      const rawText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(rawText)
      } catch {
        // keep rawText for message fallback
      }
      const message =
        errorData.detail ||
        errorData.message ||
        rawText ||
        "Failed to execute campaign"

      return NextResponse.json(
        { error: message },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error executing campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
