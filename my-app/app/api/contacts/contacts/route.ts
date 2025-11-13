import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organization = searchParams.get("organization")

    if (!organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("page_size") || "50"
    const tagSlug = searchParams.get("tags__slug")
    const tagSlugs = searchParams.get("tags__slug__in")
    const tagName = searchParams.get("tags__name__icontains")

    let url = `${BASE_URL}/contacts/contacts/?organization=${organization}&page=${page}&page_size=${pageSize}`

    if (tagSlug) url += `&tags__slug=${tagSlug}`
    if (tagSlugs) url += `&tags__slug__in=${tagSlugs}`
    if (tagName) url += `&tags__name__icontains=${tagName}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    if (!body.phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const response = await fetch(`${BASE_URL}/contacts/contacts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
