import { NextResponse } from "next/server"
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone_number_id, pin, access_token } = body

    logger.debug("Register phone request", {
      phone_number_id,
      pin,
      access_token: access_token?.substring(0, 10) + "...",
    })

    if (!phone_number_id || !pin || !access_token) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: {
            phone_number_id: !!phone_number_id,
            pin: !!pin,
            access_token: !!access_token,
          },
        },
        { status: 400 },
      )
    }

    const url = `https://graph.facebook.com/v22.0/${phone_number_id}/register`

    logger.debug("Making request to Facebook register endpoint", { url })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin,
        access_token,
      }),
    })

    const data = await response.json()
    logger.debug("Facebook API response received", { data })

    if (!response.ok) {
      logger.error("Facebook API error during phone registration", { error: data })
      return NextResponse.json(
        {
          error: "Failed to register phone",
          details: data,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error("Server error during phone registration", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
