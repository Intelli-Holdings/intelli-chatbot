import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { validateBody } from "@/lib/validations/api"
import { logger } from "@/lib/logger"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/** Schema for POST /api/appservice/connect/whatsapp */
const connectWhatsAppSchema = z.object({
  organization_id: z.string().min(1, "Organization ID is required"),
  // New Embedded Signup flow (code-based)
  code: z.string().optional(),
  is_coexistence: z.boolean().optional().default(false),
  waba_id: z.string().optional(),
  phone_number_id: z.string().optional(),
  // Legacy flow (access_token-based)
  access_token: z.string().optional(),
  phone_number: z.string().optional(),
  whatsapp_business_account_id: z.string().optional(),
  // Shared optional fields
  assistant_id: z.string().optional(),
  chatbot_flow_id: z.string().optional(),
}).refine(
  (data) => data.code || data.access_token,
  { message: "Either 'code' (Embedded Signup) or 'access_token' (legacy) is required" }
)

// POST /api/appservice/connect/whatsapp
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const validation = validateBody(connectWhatsAppSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const url = `${BASE_URL}/appservice/connect/whatsapp/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error("WhatsApp connect error", { data })
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error connecting WhatsApp", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
