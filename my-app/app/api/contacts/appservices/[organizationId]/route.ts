import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { organizationId: string } }) {
  const { organizationId } = params

  try {

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/appservice/org/${organizationId}/appservices/`

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "v0-proxy/1.0",
      },
    })


    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Backend error response: ${errorText}`)
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] App services proxy error:", error)
    return NextResponse.json(
      { error: "Failed to fetch app services", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
