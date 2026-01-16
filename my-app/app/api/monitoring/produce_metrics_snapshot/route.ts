import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

interface ProduceMetricsRequest {
  organization_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ProduceMetricsRequest = await request.json()
    const { organization_id } = body

    if (!organization_id) {
      return NextResponse.json({ error: "organization_id is required" }, { status: 400 })
    }

    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      return NextResponse.json({ error: "API base URL not configured" }, { status: 500 })
    }

    // Call external API to produce snapshot
    const response = await fetch(`${apiBaseUrl}/monitoring/produce_metrics_snapshot/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ organization_id }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to produce metrics snapshot: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error producing metrics snapshot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
