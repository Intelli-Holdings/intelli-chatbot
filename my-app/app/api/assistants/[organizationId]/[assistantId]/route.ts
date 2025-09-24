import { type NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string; assistantId: string } },
) {
  const { organizationId, assistantId } = params

  try {
    const body = await request.json()
    console.log(`[intelli] Editing assistant ${assistantId} for organization: ${organizationId}`, body)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistantId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log(`[intelli] Backend edit response status: ${response.status}`)

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}))
      console.error(`[intelli] Backend edit error:`, errorData)
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[intelli] Successfully edited assistant:`, data)

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

  try {
    console.log(`[intelli] Deleting assistant ${assistantId} for organization: ${organizationId}`)

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistantId}/`
    console.log(`[intelli] Making DELETE request to: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "User-Agent": "NextJS-Proxy/1.0",
      },
    })

    console.log(`[intelli] Backend delete response status: ${response.status}`)
    console.log(`[intelli] Backend delete response headers:`, Object.fromEntries(response.headers.entries()))

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
