import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// GET /api/campaigns/[id] - Get campaign by ID
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

    const url = `${BASE_URL}/broadcast/core/campaigns/${params.id}/?organization=${organization}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch campaign" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error fetching campaign:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(
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

    const body = await request.json()
    const url = `${BASE_URL}/broadcast/core/campaigns/${params.id}/?organization=${organization}`

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("Backend error updating campaign:", {
        status: response.status,
        error: errorData,
        url,
      })
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Failed to update campaign" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error updating campaign:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
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

    const searchParams = request.nextUrl.searchParams
    const organization = searchParams.get("organization")

    if (!organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const url = `${BASE_URL}/broadcast/core/campaigns/${params.id}/?organization=${organization}`

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to delete campaign" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error("Error deleting campaign:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
