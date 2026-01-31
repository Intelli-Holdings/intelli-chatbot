import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/appservice/create-instagram - Create a new Instagram AppService
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.organization_id || !body.instagram_business_account_id) {
      return NextResponse.json(
        { error: "Missing required fields: organization_id and instagram_business_account_id are required" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/appservice/create-instagram-appservice/`

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
      console.error("Instagram AppService creation error:", data)
      return NextResponse.json(
        data,
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating Instagram AppService:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
