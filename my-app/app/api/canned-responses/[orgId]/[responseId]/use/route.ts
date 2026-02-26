import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; responseId: string }> }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orgId, responseId } = await params

    const response = await fetch(
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/${responseId}/use/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error recording canned response usage", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    )
  }
}
