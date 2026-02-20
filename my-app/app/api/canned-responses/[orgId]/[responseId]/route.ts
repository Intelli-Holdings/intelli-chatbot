import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL

export async function GET(
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
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/${responseId}/`,
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
    logger.error("Error fetching canned response", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to fetch canned response" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/${responseId}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error updating canned response", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to update canned response" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      `${BACKEND_URL}/appservice/org/${orgId}/canned-responses/${responseId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (response.status === 204) {
      return NextResponse.json({ message: "Deleted successfully" }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    logger.error("Error deleting canned response", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to delete canned response" },
      { status: 500 }
    )
  }
}
