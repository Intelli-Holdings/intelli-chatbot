import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(
  request: NextRequest,
  { params }: { params: { import_job_id: string } }
) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const importJobId = params.import_job_id

    if (!importJobId) {
      return NextResponse.json({ error: "Import job ID is required" }, { status: 400 })
    }

    // Fetch import status from backend
    const response = await fetch(
      `${BASE_URL}/contacts/imports/contacts/${importJobId}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error checking import status", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to check import status" },
      { status: 500 }
    )
  }
}
