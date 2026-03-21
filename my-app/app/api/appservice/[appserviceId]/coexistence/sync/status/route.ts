import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appserviceId: string }> }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { appserviceId } = await params
    const url = `${BASE_URL}/appservice/${appserviceId}/coexistence/sync/status/`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await response.text()
      logger.error("Coexistence sync status: non-JSON response", { status: response.status, body: text.slice(0, 500) })
      return NextResponse.json({ error: `Backend returned HTTP ${response.status}` }, { status: response.status || 502 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("Error fetching sync status", { error: message })
    return NextResponse.json({ error: `Status check failed: ${message}` }, { status: 502 })
  }
}
