import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// WhatsApp API configuration
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v24.0"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientNumber, messageId, emoji, organizationId } = await request.json()

    // Validate required fields
    if (!recipientNumber || !messageId || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: recipientNumber, messageId, or organizationId" },
        { status: 400 },
      )
    }

    // Fetch WhatsApp credentials from database
    const token = await getToken()
    const appServiceResponse = await fetch(`${API_BASE_URL}/appservice/org/${organizationId}/appservices/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!appServiceResponse.ok) {
      console.error("Failed to fetch app service credentials")
      return NextResponse.json(
        { error: "Failed to fetch WhatsApp credentials. Please ensure your WhatsApp account is configured." },
        { status: 500 },
      )
    }

    const appServiceData = await appServiceResponse.json()
    const appService = appServiceData[0] || appServiceData.results?.[0]

    if (!appService?.access_token || !appService?.phone_number_id) {
      console.error("WhatsApp credentials not found in database")
      return NextResponse.json(
        { error: "WhatsApp credentials not found. Please configure your WhatsApp Business Account." },
        { status: 500 },
      )
    }

    // Validate messageId format (WhatsApp message IDs typically start with "wamid.")
    if (!messageId.startsWith("wamid.")) {
      console.warn(`Invalid WhatsApp message ID format: ${messageId}`)
      return NextResponse.json(
        { error: "Invalid WhatsApp message ID format. Expected format: wamid.XXX" },
        { status: 400 },
      )
    }

    // If emoji is empty, we're removing the reaction
    const reactionPayload = emoji ? { message_id: messageId, emoji } : { message_id: messageId, emoji: "" }

    console.log(`Sending reaction to WhatsApp:`, {
      to: recipientNumber,
      messageId,
      emoji: emoji || "(removing)",
      phoneNumberId: appService.phone_number_id,
    })

    // Send reaction to WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${appService.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appService.access_token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientNumber,
          type: "reaction",
          reaction: reactionPayload,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("WhatsApp API error:", errorData)

      // Handle specific WhatsApp error codes
      if (errorData.error?.code === 131009) {
        return NextResponse.json(
          { error: "Cannot react to this message. It may be too old (>30 days), deleted, or not found." },
          { status: 400 },
        )
      }

      return NextResponse.json(
        { error: "Failed to send reaction to WhatsApp", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("WhatsApp reaction sent successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sending reaction:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
