import { type NextRequest, NextResponse } from "next/server"

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
    const accessToken = getAccessToken(request)
    const phoneNumberId = getPhoneNumberId(request)

    const messageData = await request.json()

    // Validate required fields
    if (!messageData.to || !messageData.template) {
      return NextResponse.json({ error: "Missing required fields: 'to' and 'template'" }, { status: 400 })
    }

    const requestBody = {
      messaging_product: "whatsapp",
      to: messageData.to,
      type: "template",
      template: {
        name: messageData.template.name,
        language: {
          code: messageData.template.language || "en_US",
        },
        namespace: messageData.template.namespace,
        components: messageData.template.components || [],
      },
    }

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to send test message" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/whatsapp/messages:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
