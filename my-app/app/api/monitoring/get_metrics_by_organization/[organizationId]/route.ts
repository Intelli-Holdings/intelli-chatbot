import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { organizationId } = params
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const period = searchParams.get("period") || "7"

    const { getToken } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      return NextResponse.json({ error: "API base URL not configured" }, { status: 500 })
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("from", from)
    queryParams.append("to", to)
    queryParams.append("period", period)

    const response = await fetch(
      `${apiBaseUrl}/monitoring/get_metrics_by_organization/${organizationId}/?${queryParams.toString()}`,
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
        return NextResponse.json({ message: "No metrics data found for this organization", data: [] }, { status: 404 })
      }
      return NextResponse.json(
        { error: `Failed to fetch metrics: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching metrics by organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
