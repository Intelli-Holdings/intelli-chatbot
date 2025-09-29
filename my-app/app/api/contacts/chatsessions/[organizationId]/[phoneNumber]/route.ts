import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string; phoneNumber: string } },
) {
  const { organizationId, phoneNumber } = params

  try {

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/org/${organizationId}/${phoneNumber}/`


    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "intelli-proxy/1.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[intelli] Backend error response: ${errorText}`)
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[intelli] Chat sessions proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat sessions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
