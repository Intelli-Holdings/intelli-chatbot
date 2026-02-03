import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

interface MetricsSummary {
  organization_id: string
  period: string
  total_conversations: number
  avg_conversations: number
  total_leads: number
  avg_leads: number
  total_reservations: number
  avg_reservations: number
  avg_active_conversations: number
  avg_engagement_rate: number
  period_start: string
  period_end: string
}

export async function GET(request: NextRequest) {
  try {
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
      `${apiBaseUrl}/monitoring/get_metrics_summary_by_organization/${organizationId}/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "No metrics summary data found for this organization" }, { status: 404 })
      }
      return NextResponse.json(
        { error: `Failed to fetch metrics summary: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data: MetricsSummary = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching metrics summary by organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
