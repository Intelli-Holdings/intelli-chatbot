import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// GET /api/campaigns/whatsapp - List WhatsApp campaigns
export async function GET(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organization = searchParams.get("organization")

    if (!organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append("organization", organization)

    const page = searchParams.get("page")
    const pageSize = searchParams.get("page_size")
    const status = searchParams.get("status")

    if (page) params.append("page", page)
    if (pageSize) params.append("page_size", pageSize)
    if (status) params.append("status", status)

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch WhatsApp campaigns" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching WhatsApp campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
