import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// DELETE /api/channels/whatsapp/[id]/delete - Delete a WhatsApp package
export async function DELETE(
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

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    const url = `${BASE_URL}/api/channels/whatsapp/${id}/delete/`

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to delete WhatsApp package" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error("Error deleting WhatsApp package", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
