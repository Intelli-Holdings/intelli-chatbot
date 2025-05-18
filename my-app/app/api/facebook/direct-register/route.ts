import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone_number_id, pin, access_token, system_token } = body

    console.log("Direct register phone request:", {
      phone_number_id,
      pin,
      hasAccessToken: !!access_token,
      hasSystemToken: !!system_token,
    })

    if (!phone_number_id || !pin || (!access_token && !system_token)) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: {
            phone_number_id: !!phone_number_id,
            pin: !!pin,
            access_token: !!access_token || !!system_token,
          },
        },
        { status: 400 },
      )
    }

    // Use the token provided, preferring system token if available
    const token = system_token || access_token

    // Validate the token first
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}|${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}`,
    )
    const debugData = await debugResponse.json()
    
    if (!debugData.data?.is_valid) {
      return NextResponse.json(
        {
          error: "Invalid token",
          details: debugData,
        },
        { status: 401 },
      )
    }

    console.log("Token debug info:", {
      isValid: debugData.data?.is_valid,
      scopes: debugData.data?.scopes,
      type: debugData.data?.type,
    })

    // This is a direct implementation of the example code provided
    const url = `https://graph.facebook.com/v22.0/${phone_number_id}/register`

    console.log(`Making direct request to: ${url}`)

    // Always use the token in the URL for better compatibility
    const urlWithToken = `${url}?access_token=${encodeURIComponent(token)}`

    const response = await fetch(urlWithToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin,
      }),
    })

    const data = await response.json()
    console.log("Direct Facebook API response:", data)

    if (data.error) {
      if (data.error.code === 100) {
        return NextResponse.json(
          {
            error: "Missing Permission",
            details: "The token does not have the required permissions. Please use a System User Token instead.",
            original_error: data.error,
          },
          { status: 403 },
        )
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
