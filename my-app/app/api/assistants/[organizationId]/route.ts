import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { organizationId: string } }) {
  const { organizationId } = params

  try {
    console.log(` Proxying request for organization: ${organizationId}`)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/api/get/assistants/${organizationId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Vary": "Accept"
        },
      },
    )

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      console.error(` Backend error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(` Successfully fetched ${data.length} assistants`)

    return NextResponse.json(data)
  } catch (error) {
    console.error(" Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch assistants from backend" }, { status: 500 })
  }
}
