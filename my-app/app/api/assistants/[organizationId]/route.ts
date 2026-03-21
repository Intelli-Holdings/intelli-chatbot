import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";
export async function GET(request: NextRequest, { params }: { params: { organizationId: string } }) {
  const { organizationId } = params

  // Check authentication and get session token
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get Clerk JWT token to forward to backend
  const token = await getToken()

  if (!token) {
    return NextResponse.json(
      { error: 'Unable to get authentication token' },
      { status: 401 }
    )
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Vary": "Accept",
          "Authorization": `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      logger.error(` Backend error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    logger.error(" Proxy error:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Failed to fetch assistants from backend" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { organizationId: string } }) {
  const { organizationId } = params

  try {
    // Get authentication from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    )


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error(` Backend error:`, { error: errorData instanceof Error ? errorData.message : String(errorData) })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create assistant' },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    logger.error(" Error creating assistant:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
