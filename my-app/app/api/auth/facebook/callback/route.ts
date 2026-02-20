import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_VERSION = "v21.0"

type PageInfo = {
  id: string
  name?: string
  access_token?: string
  instagram_business_account?: { id: string }
}

const decodeState = (state: string | null) => {
  if (!state) return null
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8")
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

const persistMetaCredentials = async ({
  organizationId,
  pageId,
  pageAccessToken,
  instagramBusinessAccountId,
  userAccessToken,
  channel,
}: {
  organizationId?: string
  pageId: string
  pageAccessToken?: string
  instagramBusinessAccountId?: string
  userAccessToken: string
  channel: string
}) => {
  const persistUrl = process.env.META_CHANNELS_PERSIST_URL
  const serviceToken = process.env.META_CHANNELS_SERVICE_TOKEN

  if (!persistUrl || !serviceToken || !organizationId) {
    return { persisted: false }
  }

  const payload = {
    choice: channel,
    organization_id: organizationId,
    data: {
      page_id: pageId,
      page_access_token: pageAccessToken,
      instagram_business_account_id: instagramBusinessAccountId,
      user_access_token: userAccessToken,
    },
  }

  const response = await fetch(persistUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || "Failed to persist Meta credentials")
  }

  return { persisted: true }
}

export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Missing Facebook app credentials" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  const decodedState = decodeState(state)
  const storedState = cookies().get("meta_oauth_state")?.value
  if (!decodedState || !storedState || decodedState.nonce !== storedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 })
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = new URL("/api/auth/facebook/callback", appBaseUrl).toString()
  const tokenUrl = new URL(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`)
  tokenUrl.searchParams.set("client_id", appId)
  tokenUrl.searchParams.set("client_secret", appSecret)
  tokenUrl.searchParams.set("redirect_uri", redirectUri)
  tokenUrl.searchParams.set("code", code)

  const shortLivedResponse = await fetch(tokenUrl.toString())
  const shortLivedData = await shortLivedResponse.json()
  if (!shortLivedResponse.ok) {
    return NextResponse.json({ error: "Failed to exchange code", details: shortLivedData }, { status: 400 })
  }

  const exchangeUrl = new URL(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`)
  exchangeUrl.searchParams.set("grant_type", "fb_exchange_token")
  exchangeUrl.searchParams.set("client_id", appId)
  exchangeUrl.searchParams.set("client_secret", appSecret)
  exchangeUrl.searchParams.set("fb_exchange_token", shortLivedData.access_token)

  const longLivedResponse = await fetch(exchangeUrl.toString())
  const longLivedData = await longLivedResponse.json()
  if (!longLivedResponse.ok) {
    return NextResponse.json({ error: "Failed to exchange long-lived token", details: longLivedData }, { status: 400 })
  }

  const userAccessToken = longLivedData.access_token
  const pagesUrl = new URL(`https://graph.facebook.com/${API_VERSION}/me/accounts`)
  pagesUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account")
  pagesUrl.searchParams.set("access_token", userAccessToken)

  const pagesResponse = await fetch(pagesUrl.toString())
  const pagesData = await pagesResponse.json()
  if (!pagesResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch pages", details: pagesData }, { status: 400 })
  }

  const pageId = process.env.META_PAGE_ID
  const pages = (pagesData.data || []) as PageInfo[]
  const selectedPage = pageId ? pages.find((page) => page.id === pageId) : pages[0]

  if (!selectedPage) {
    return NextResponse.json({ error: "No matching page found", details: pagesData }, { status: 400 })
  }

  const instagramBusinessAccountId = selectedPage.instagram_business_account?.id
  const channel = decodedState.channel === "instagram" ? "instagram" : "facebook_messenger"

  await persistMetaCredentials({
    organizationId: decodedState.organization_id,
    pageId: selectedPage.id,
    pageAccessToken: selectedPage.access_token,
    instagramBusinessAccountId,
    userAccessToken,
    channel,
  })

  cookies().set("meta_oauth_state", "", { maxAge: 0, path: "/" })

  const successRedirect = process.env.NEXT_PUBLIC_META_SUCCESS_REDIRECT || `${appBaseUrl}/dashboard`
  const redirectUrl = new URL(successRedirect)
  redirectUrl.searchParams.set("meta_connected", "true")
  redirectUrl.searchParams.set("channel", channel)
  if (instagramBusinessAccountId) {
    redirectUrl.searchParams.set("instagram_business_account_id", instagramBusinessAccountId)
  }

  return NextResponse.redirect(redirectUrl.toString())
}
