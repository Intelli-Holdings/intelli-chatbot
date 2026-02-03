import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// PUT /api/channels/whatsapp/[id]/update - Update a WhatsApp package
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    const url = `${BASE_URL}/api/channels/whatsapp/${id}/update/`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to update WhatsApp package" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating WhatsApp package:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
