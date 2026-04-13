import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get("organization")
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const params = new URLSearchParams()
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const page = searchParams.get("page")
    if (status) params.append("status", status)
    if (category) params.append("category", category)
    if (page) params.append("page", page)

    const url = `${BASE_URL}/support/org/${organizationId}/tickets/?${params.toString()}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch tickets" },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const organizationId = formData.get("organization")
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const url = `${BASE_URL}/support/org/${organizationId}/tickets/`
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || errorData.error || "Failed to create ticket" },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json(), { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
