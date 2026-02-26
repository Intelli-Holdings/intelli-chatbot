import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { logger } from "@/lib/logger";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/appservice/create - Create a new AppService
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.organization_id || !body.phone_number) {
      return NextResponse.json(
        { error: "Missing required fields: organization_id and phone_number are required" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/appservice/create-appservice/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error("AppService creation error:", { data: data })
      return NextResponse.json(
        data,
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error("Error creating AppService:", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
