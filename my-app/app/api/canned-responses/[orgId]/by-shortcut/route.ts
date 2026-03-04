import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orgId } = await params
    const { searchParams } = new URL(request.url)
    const shortcut = searchParams.get("shortcut")

    if (!shortcut) {
      return NextResponse.json(
        { error: "shortcut parameter is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/by-shortcut/?shortcut=${encodeURIComponent(shortcut)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error fetching canned response by shortcut", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to fetch canned response" },
      { status: 500 }
    )
  }
}
