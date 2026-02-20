import { NextResponse } from "next/server"
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, redirect_uri } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    logger.info("Exchanging code for token")

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET

    if (!appId || !appSecret) {
      logger.error("Missing Facebook app credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Build params - include redirect_uri only if provided (needed for redirect-based OAuth)
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code: code,
    })

    // Add redirect_uri if provided (required for Messenger redirect flow)
    if (redirect_uri) {
      params.set('redirect_uri', redirect_uri)
    }

    logger.info("Calling Facebook token exchange", {
      client_id: appId,
      code: code.substring(0, 20) + '...',
      redirect_uri: redirect_uri || '(not provided)',
    })

    const response = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?${params.toString()}`, {
      method: "GET",
    })

    const data = await response.json()
    logger.info("Token exchange response", {
      status: response.status,
      statusText: response.statusText,
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      error: data.error,
      errorDescription: data.error_description,
    })

    if (!response.ok || data.error) {
      logger.error("Facebook API error", { data: JSON.stringify(data, null, 2) })
      return NextResponse.json({
        error: data.error?.message || data.error_description || "Failed to exchange code",
        details: data
      }, { status: 500 })
    }

    // If we got a token, let's verify it and get its details
    if (data.access_token) {
      try {
        const debugAppSecret = process.env.FACEBOOK_APP_SECRET
        const debugResponse = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${data.access_token}&access_token=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}|${debugAppSecret}`,
        )
        const debugData = await debugResponse.json()
        logger.info("Token debug info", {
          isValid: debugData.data?.is_valid,
          scopes: debugData.data?.scopes,
          appId: debugData.data?.app_id,
          expiresAt: debugData.data?.expires_at,
        })
      } catch (debugError) {
        logger.error("Error debugging token", { error: debugError instanceof Error ? debugError.message : String(debugError) })
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error("Server error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}