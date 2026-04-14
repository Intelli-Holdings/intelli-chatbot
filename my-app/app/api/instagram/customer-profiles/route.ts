import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || "v22.0"

export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { organization_id, instagram_business_account_id, customer_ids } = body

    if (!organization_id || !instagram_business_account_id || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Cap batch size to avoid abuse
    const ids = customer_ids.slice(0, 30)

    // Fetch app services from backend (server-to-server) to get the access token
    const appServicesRes = await fetch(
      `${API_BASE_URL}/appservice/paginated/org/${organization_id}/instagram/appservices/?page=1&page_size=10`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!appServicesRes.ok) {
      logger.error("Failed to fetch app services for profile resolution", { status: appServicesRes.status })
      return NextResponse.json({ profiles: {} })
    }

    const appServicesData = await appServicesRes.json()
    const appServices = Array.isArray(appServicesData) ? appServicesData : appServicesData.results || []
    const appService = appServices.find(
      (s: any) => s.instagram_business_account_id === instagram_business_account_id,
    )

    const accessToken = appService?.instagram_access_token
    if (!accessToken) {
      logger.warn("No access token found for Instagram business account", { instagram_business_account_id })
      return NextResponse.json({ profiles: {} })
    }

    // Resolve profiles from Facebook Graph API in parallel
    const profiles: Record<string, { name: string; username?: string; profile_pic?: string }> = {}

    const results = await Promise.allSettled(
      ids.map(async (customerId: string) => {
        const url = `https://graph.facebook.com/${META_API_VERSION}/${customerId}?fields=name,username,profile_pic&access_token=${accessToken}`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        if (data.name || data.username) {
          profiles[customerId] = {
            name: data.name || data.username,
            username: data.username,
            profile_pic: data.profile_pic,
          }
        }
      }),
    )

    return NextResponse.json({ profiles })
  } catch (error) {
    logger.error("Failed to resolve Instagram customer profiles", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to resolve profiles" }, { status: 500 })
  }
}
