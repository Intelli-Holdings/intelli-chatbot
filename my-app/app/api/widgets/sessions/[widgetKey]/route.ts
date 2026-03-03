import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetKey: string } }
) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const widgetKey = params.widgetKey

    if (!widgetKey) {
      return NextResponse.json({ error: "Widget key is required" }, { status: 400 })
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page')
    const pageSize = searchParams.get('page_size')

    // Build query string
    const queryParams = new URLSearchParams()
    if (page) queryParams.append('page', page)
    if (pageSize) queryParams.append('page_size', pageSize)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

    // Fetch sessions from backend
    const response = await fetch(
      `${BASE_URL}/widgets/sessions/${widgetKey}/${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Widget sessions error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to fetch widget sessions" },
      { status: 500 }
    )
  }
}
