import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

interface MetricsSnapshot {
  id: number
  free_token: number
  used_token: number
  payed_token: number
  total_token: number
  remaining_token: number
  num_conversations: number
  num_messages: number
  num_escalations: number
  num_pending: number
  num_assigned: number
  num_resolved: number
  conversations_per_channel: any
  created_at: string
  updated_at: string
  organization: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "30"

    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      return NextResponse.json({ error: "API base URL not configured" }, { status: 500 })
    }

    // Fetch metrics snapshots from backend
    const response = await fetch(
      `${apiBaseUrl}/monitoring/get_metrics_by_organization/${organizationId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: "No metrics data found for this organization" },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch metrics: ${response.statusText}` },
        { status: response.status }
      )
    }

    const snapshots: MetricsSnapshot[] = await response.json()

    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json(
        { message: "No metrics data found for this organization" },
        { status: 404 }
      )
    }

    // Filter by period if needed
    const periodDays = parseInt(period)
    const now = new Date()
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const filteredSnapshots = snapshots.filter(s => {
      const snapshotDate = new Date(s.created_at)
      return snapshotDate >= periodStart
    })

    const relevantSnapshots = filteredSnapshots.length > 0 ? filteredSnapshots : snapshots

    // Get latest snapshot
    const latest = relevantSnapshots[relevantSnapshots.length - 1]

    // Calculate summary from all relevant snapshots
    const summary = {
      total_conversations: latest.num_conversations,
      total_messages: latest.num_messages,
      total_pending: latest.num_pending,
      total_assigned: latest.num_assigned,
      total_resolved: latest.num_resolved,
      total_tokens_used: latest.used_token,
      avg_tokens_remaining: latest.remaining_token,
      record_count: relevantSnapshots.length,
    }

    // Build response in expected format
    const responseData = {
      summary,
      latest,
      timeline: relevantSnapshots,
      organization: organizationId,
      from: relevantSnapshots[0]?.created_at || "",
      to: latest.created_at,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching metrics summary by organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
