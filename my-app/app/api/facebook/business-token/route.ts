import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { waba_id } = body

    if (!waba_id) {
      return NextResponse.json({ error: "WhatsApp Business Account ID is required" }, { status: 400 })
    }

    console.log("Getting business token for WABA ID:", waba_id)

    // Use app credentials to get a system user access token
    // This is the recommended approach for WhatsApp Business API
    const appAccessTokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}&grant_type=client_credentials`,
    )

    const appTokenData = await appAccessTokenResponse.json()
    
    if (!appAccessTokenResponse.ok || !appTokenData.access_token) {
      console.error("Failed to get app access token:", appTokenData)
      return NextResponse.json(
        { error: "Failed to get app access token", details: appTokenData },
        { status: 500 },
      )
    }

    console.log("Got app access token")

    // Now get the system user access token for the WhatsApp Business Account
    const wabaTokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/${waba_id}?fields=messaging_app_id,owner_business_info&access_token=${appTokenData.access_token}`,
    )

    const wabaData = await wabaTokenResponse.json()
    
    if (!wabaTokenResponse.ok) {
      console.error("Failed to get WABA info:", wabaData)
      return NextResponse.json(
        { error: "Failed to get WhatsApp Business Account info", details: wabaData },
        { status: 500 },
      )
    }

    console.log("WABA info:", {
      messaging_app_id: wabaData.messaging_app_id,
      business_id: wabaData.owner_business_info?.id,
    })

    // Get a system user access token with WhatsApp permissions
    // This requires that you've created a system user in Business Manager with WhatsApp permissions
    const systemUserTokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/${wabaData.owner_business_info?.id}/system_user_access_token?access_token=${appTokenData.access_token}&scope=whatsapp_business_messaging,whatsapp_business_management`,
    )

    const systemTokenData = await systemUserTokenResponse.json()
    
    if (!systemUserTokenResponse.ok) {
      console.error("Failed to get system user token:", systemTokenData)
      return NextResponse.json(
        { error: "Failed to get system user token", details: systemTokenData },
        { status: 500 },
      )
    }

    return NextResponse.json({
      access_token: systemTokenData.access_token,
      token_type: "system_user",
      app_id: wabaData.messaging_app_id,
      business_id: wabaData.owner_business_info?.id,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
