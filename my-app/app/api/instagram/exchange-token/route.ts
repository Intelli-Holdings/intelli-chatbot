import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger";

/**
 * Exchange Instagram OAuth authorization code for access token
 * This endpoint handles the Instagram OAuth flow token exchange
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
    const appSecret = process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

    if (!appId || !appSecret || !redirectUri) {
      logger.error("Missing Instagram app configuration")
      return NextResponse.json({ error: "Instagram app not configured" }, { status: 500 })
    }

    // Exchange code for short-lived access token
    const tokenUrl = "https://api.instagram.com/oauth/access_token"
    const formData = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: code,
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      logger.error("Instagram token exchange error", { error: tokenData })
      return NextResponse.json(
        { error: tokenData.error_message || tokenData.error || "Failed to exchange code" },
        { status: tokenResponse.status }
      )
    }

    // Short-lived token received
    const shortLivedToken = tokenData.access_token
    const userId = tokenData.user_id

    // Exchange short-lived token for long-lived token
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`

    const longLivedResponse = await fetch(longLivedUrl, {
      method: "GET",
    })

    const longLivedData = await longLivedResponse.json()

    if (!longLivedResponse.ok) {
      logger.error("Instagram long-lived token exchange error", { error: longLivedData })
      // Return short-lived token if long-lived exchange fails
      return NextResponse.json({
        access_token: shortLivedToken,
        user_id: userId,
        token_type: "short-lived",
        expires_in: 3600, // 1 hour for short-lived tokens
      })
    }

    // Return long-lived token (valid for 60 days)
    return NextResponse.json({
      access_token: longLivedData.access_token,
      user_id: userId,
      token_type: longLivedData.token_type || "long-lived",
      expires_in: longLivedData.expires_in || 5184000, // 60 days
    })
  } catch (error) {
    logger.error("Error in Instagram token exchange", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
