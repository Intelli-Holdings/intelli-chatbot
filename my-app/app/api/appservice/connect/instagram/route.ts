import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { validateBody } from "@/lib/validations/api"
import { logger } from "@/lib/logger"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/** Schema for POST /api/appservice/connect/instagram */
const connectInstagramSchema = z.object({
  organization_id: z.string().min(1, "Organization ID is required"),
  // Embedded Signup flow (code-based) - preferred
  code: z.string().optional(),
  redirect_uri: z.string().optional(),
  // Legacy flow (access_token-based)
  access_token: z.string().optional(),
  instagram_business_account_id: z.string().optional(),
  page_id: z.string().optional(),
  page_name: z.string().optional(),
  // Shared optional fields
  assistant_id: z.string().optional(),
  chatbot_flow_id: z.string().optional(),
}).refine(
  (data) => data.code || data.access_token,
  { message: "Either 'code' (Embedded Signup) or 'access_token' (legacy) is required" }
)

// POST /api/appservice/connect/instagram
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const validation = validateBody(connectInstagramSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const url = `${BASE_URL}/appservice/connect/instagram/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Handle non-JSON responses (e.g. HTML error pages, timeouts)
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await response.text()
      logger.error("Instagram connect: non-JSON response", {
        status: response.status,
        contentType,
        body: text.slice(0, 500),
      })
      return NextResponse.json(
        { error: `Backend returned HTTP ${response.status}`, code: "backend_error" },
        { status: response.status || 502 },
      )
    }

    const data = await response.json()

    if (!response.ok) {
      logger.error("Instagram connect error", { status: response.status, data })
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("Error connecting Instagram", { error: message })
    return NextResponse.json(
      { error: `Connection failed: ${message}`, code: "proxy_error" },
      { status: 502 },
    )
  }
}
