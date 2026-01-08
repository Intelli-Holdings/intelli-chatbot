import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string; assistantId: string } },
) {
  const { organizationId, assistantId } = params

  // Check authentication and get session token
  const { userId, getToken } = auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get Clerk JWT token to forward to backend
  const token = await getToken()

  if (!token) {
    return NextResponse.json(
      { error: 'Unable to get authentication token' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistantId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}))
      console.error(`[intelli] Backend edit error:`, errorData)
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[intelli] Edit assistant proxy error:", error)
    return NextResponse.json({ error: "Failed to edit assistant" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string; assistantId: string } },
) {
  const { organizationId, assistantId } = params

  // Check authentication and get session token
  const { userId, getToken } = auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get Clerk JWT token to forward to backend
  const token = await getToken()

  if (!token) {
    return NextResponse.json(
      { error: 'Unable to get authentication token' },
      { status: 401 }
    )
  }

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistantId}/`

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "User-Agent": "NextJS-Proxy/1.0",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      let errorData: { detail?: string } = {}
      try {
        errorData = await response.json()
      } catch (e) {
        console.log(`[intelli] Could not parse error response as JSON`)
      }
      console.error(`[intelli] Backend delete error:`, errorData)
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    let data = { success: true }
    if (response.status !== 204) {
      try {
        const responseText = await response.text()
        console.log(`[intelli] Backend delete response text:`, responseText)
        if (responseText) {
          data = JSON.parse(responseText)
        }
      } catch (e) {
        console.log(`[intelli] Could not parse delete response as JSON, using default success response`)
      }
    }

    console.log(`[intelli] Successfully deleted assistant`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[intelli] Delete assistant proxy error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("[intelli] Delete error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json({ error: "Failed to delete assistant", details: errorMessage }, { status: 500 })
  }
}
