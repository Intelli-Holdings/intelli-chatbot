import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { channelCreateSchema, validateBody } from "@/lib/validations/api"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/channels/create - Create a new channel package (WhatsApp, Instagram, etc.)
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Zod validation
    const validation = validateBody(channelCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const url = `${BASE_URL}/api/channels/create/`

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
      logger.error("Channel package creation error", { data })
      return NextResponse.json(
        data,
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error("Error creating channel package", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
