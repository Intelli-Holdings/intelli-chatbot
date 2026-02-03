import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/whatsapp/templates/[id]/send_test - proxy to backend test send endpoint
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

    if (!body.organization && !body.organization_id) {
      return NextResponse.json(
        { error: "organization is required to send a test" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/broadcast/whatsapp/templates/${params.id}/send_test/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const rawText = await response.text()
    let data: any = {}
    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = { detail: rawText }
    }

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        rawText ||
        "Failed to send test message"

      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending template test:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
