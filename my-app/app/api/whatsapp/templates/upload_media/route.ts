import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// NOTE: For large file uploads, ensure nginx/reverse proxy has:
// client_max_body_size 100m;
// in the server/location block

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/whatsapp/templates/upload_media - proxy to backend upload endpoint
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the form data from the request
    const formData = await request.formData()

    const url = `${BASE_URL}/broadcast/whatsapp/templates/upload_media/`

    console.log('Proxying media upload to backend:', url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
      },
      body: formData,
    })

    const rawText = await response.text()
    let data: any = {}
    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {
      data = { detail: rawText }
    }

    if (!response.ok) {
      const message =
        data.error ||
        data.detail ||
        data.message ||
        rawText ||
        "Failed to upload media"

      console.error('Backend upload failed:', message)
      return NextResponse.json(
        { error: message, raw: data },
        { status: response.status }
      )
    }

    console.log('Backend upload successful:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
