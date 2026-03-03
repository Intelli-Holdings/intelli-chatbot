import { type NextRequest, NextResponse } from "next/server"
import { whatsappMessageSchema, validateBody } from "@/lib/validations/api"
import { apiLimiter } from "@/lib/rate-limit"
import { logger } from "@/lib/logger";

// API version
const API_VERSION = "v22.0"

// Helper function to get access token from request
function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header")
  }
  return authHeader.substring(7)
}

// Helper function to get phone number ID from request
function getPhoneNumberId(request: NextRequest): string {
  const phoneNumberId = request.nextUrl.searchParams.get("phone_number_id")
  if (!phoneNumberId) {
    throw new Error("Missing phone_number_id parameter")
  }
  return phoneNumberId
}

// POST /api/whatsapp/messages - Send a test message
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous"
    const rateLimitResult = apiLimiter(ip)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const accessToken = getAccessToken(request)
    const phoneNumberId = getPhoneNumberId(request)

    const messageData = await request.json()

    // Zod validation
    const validation = validateBody(whatsappMessageSchema, {
      ...messageData,
      phoneNumberId,
      accessToken,
    })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Validate required fields
    if (!messageData.to || !messageData.template || !messageData.template.name) {
      return NextResponse.json(
        { error: "Missing required fields: 'to', 'template', and 'template.name'" },
        { status: 400 },
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(messageData.to)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use international format with country code (e.g., +1234567890)" },
        { status: 400 },
      )
    }

    // The messageData already contains the properly formatted payload from the frontend
    const requestBody = {
      messaging_product: messageData.messaging_product || "whatsapp",
      recipient_type: messageData.recipient_type || "individual",
      to: messageData.to,
      type: messageData.type || "template",
      template: {
        name: messageData.template.name,
        language: messageData.template.language || { code: "en_US" },
        components: messageData.template.components || [],
      },
    }

    logger.debug("Sending to WhatsApp API", { requestBody })

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()

    if (!response.ok) {
      logger.error("WhatsApp API Error", { data: responseData })
      return NextResponse.json(
        {
          error: responseData.error?.message || "Failed to send message",
          details: responseData.error,
        },
        { status: response.status },
      )
    }

    logger.info("WhatsApp API Success", { data: responseData })
    return NextResponse.json(responseData)
  } catch (error) {
    logger.error("Error in POST /api/whatsapp/messages", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
