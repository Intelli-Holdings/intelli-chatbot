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
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let url = `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/`
    const queryParams = new URLSearchParams()
    if (category) queryParams.append("category", category)
    if (search) queryParams.append("search", search)
    if (queryParams.toString()) url += `?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error fetching canned responses", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to fetch canned responses" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/create/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, organization_id: orgId }),
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error creating canned response", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to create canned response" },
      { status: 500 }
    )
  }
}
