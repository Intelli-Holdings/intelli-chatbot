import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const API_VERSION = "v21.0"
const DEFAULT_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
  "pages_messaging",
  "pages_show_list",
  "manage_pages",
]

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  if (!appId) {
    return NextResponse.json({ error: "Missing Facebook app id" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get("organization_id")
  const channel = searchParams.get("channel") || "facebook"

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = new URL("/api/auth/facebook/callback", appBaseUrl).toString()
  const nonce = crypto.randomUUID()
  const statePayload = {
    nonce,
    organization_id: organizationId,
    channel,
  }
  const encodedState = Buffer.from(JSON.stringify(statePayload)).toString("base64url")

  cookies().set("meta_oauth_state", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  const authUrl = new URL(`https://www.facebook.com/${API_VERSION}/dialog/oauth`)
  authUrl.searchParams.set("client_id", appId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("state", encodedState)
  authUrl.searchParams.set("scope", DEFAULT_SCOPES.join(","))

  return NextResponse.redirect(authUrl.toString())
}
