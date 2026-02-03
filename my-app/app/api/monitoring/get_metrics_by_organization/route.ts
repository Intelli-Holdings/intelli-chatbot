import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

interface MetricsSnapshot {
  id: string
  organization_id: string
  timestamp: string
  conversations: number
  leads: number
  reservations: number
  active_conversations: number
  engagement_rate: number
}

export async function GET(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get("organization_id")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const period = searchParams.get("period")

    if (!organizationId) {
      return NextResponse.json({ error: "organization_id query parameter is required" }, { status: 400 })
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      return NextResponse.json({ error: "API base URL not configured" }, { status: 500 })
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("organization_id", organizationId)
    if (from) queryParams.append("from", from)
    if (to) queryParams.append("to", to)
    if (period) queryParams.append("period", period)

    const response = await fetch(
      `${apiBaseUrl}/monitoring/get_metrics_by_organization/${organizationId}/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "No metrics data found for this organization" }, { status: 404 })
      }
      return NextResponse.json(
        { error: `Failed to fetch metrics: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data: MetricsSnapshot[] = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No metrics data found for this organization", data: [] }, { status: 200 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching metrics by organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
