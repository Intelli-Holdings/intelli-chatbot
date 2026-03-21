import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// GET /api/campaigns/whatsapp/[id]/recipients - Get campaign recipients with optional status filter
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

    const searchParams = request.nextUrl.searchParams
    const organization = searchParams.get("organization")

    if (!organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("organization", organization)

    // Optional status filter
    const status = searchParams.get("status")
    if (status) {
      queryParams.append("status", status)
    }

    // Optional pagination
    const page = searchParams.get("page")
    const pageSize = searchParams.get("page_size")
    if (page) queryParams.append("page", page)
    if (pageSize) queryParams.append("page_size", pageSize)

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/${params.id}/recipients/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch recipients" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error fetching recipients", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
