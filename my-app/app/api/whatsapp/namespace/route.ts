import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic'

// API version
const API_VERSION = "v22.0"

// Namespace response
export interface NamespaceResponse {
  id: string
  message_template_namespace: string
}

// Helper function to get access token from request
function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header")
  }
  return authHeader.substring(7)
}

// Helper function to get WABA ID from request
function getWabaId(request: NextRequest): string {
  const wabaId = request.nextUrl.searchParams.get("waba_id")
  if (!wabaId) {
    throw new Error("Missing waba_id parameter")
  }
  return wabaId
}

// GET /api/whatsapp/namespace - Get template namespace
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    const wabaId = getWabaId(request)

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${wabaId}?fields=message_template_namespace`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to fetch namespace" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error in GET /api/whatsapp/namespace", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
