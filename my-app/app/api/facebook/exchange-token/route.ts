import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    console.log("Exchanging code for token...")

    // Use the Graph API directly with the app credentials
    const response = await fetch("https://graph.facebook.com/v22.0/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        client_secret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "",
      }),
    })

    const data = await response.json()
    console.log("Token exchange response:", {
      status: response.status,
      statusText: response.statusText,
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      error: data.error,
    })

    if (!response.ok) {
      console.error("Facebook API error:", data)
      return NextResponse.json({ error: "Failed to exchange code", details: data }, { status: 500 })
    }

    // If we got a token, let's verify it and get its details
    if (data.access_token) {
      try {
        const debugResponse = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${data.access_token}&access_token=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}|${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}`,
        )
        const debugData = await debugResponse.json()
        console.log("Token debug info:", {
          isValid: debugData.data?.is_valid,
          scopes: debugData.data?.scopes,
          appId: debugData.data?.app_id,
          expiresAt: debugData.data?.expires_at,
        })
      } catch (debugError) {
        console.error("Error debugging token:", debugError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}