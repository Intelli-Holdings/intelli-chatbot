import { NextRequest, NextResponse } from "next/server"

/**
 * Instagram OAuth callback handler
 * Receives authorization code from Instagram and redirects to the dashboard
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorReason = searchParams.get("error_reason")
  const errorDescription = searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("Instagram OAuth error:", {
      error,
      errorReason,
      errorDescription,
    })

    const redirectUrl = new URL("/dashboard/channels", request.nextUrl.origin)
    redirectUrl.searchParams.set("error", errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  // Validate authorization code
  if (!code) {
    const redirectUrl = new URL("/dashboard/channels", request.nextUrl.origin)
    redirectUrl.searchParams.set("error", "No authorization code received")
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard with the code
  // The frontend will handle exchanging the code for a token
  const redirectUrl = new URL("/dashboard/channels", request.nextUrl.origin)
  redirectUrl.searchParams.set("instagram_code", code)
  redirectUrl.searchParams.set("instagram_auth", "success")

  return NextResponse.redirect(redirectUrl)
}
