import { NextRequest, NextResponse } from "next/server"

/**
 * Fetch Instagram user info and business account details
 * Used to get Instagram Business Account ID needed for messaging
 */
export async function POST(request: NextRequest) {
  try {
    const { access_token, user_id } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 })
    }

    // Get user info and business account details
    const userInfoUrl = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${access_token}`

    const userInfoResponse = await fetch(userInfoUrl, {
      method: "GET",
    })

    const userInfo = await userInfoResponse.json()

    if (!userInfoResponse.ok) {
      console.error("Instagram user info fetch error:", userInfo)
      return NextResponse.json(
        { error: userInfo.error?.message || "Failed to fetch user info" },
        { status: userInfoResponse.status }
      )
    }

    // For Instagram Graph API, we need the Instagram Business Account ID
    // If the account is a business account, the ID is the same
    return NextResponse.json({
      user_id: userInfo.id,
      username: userInfo.username,
      account_type: userInfo.account_type,
      instagram_business_account_id: userInfo.id,
    })
  } catch (error) {
    console.error("Error fetching Instagram user info:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
