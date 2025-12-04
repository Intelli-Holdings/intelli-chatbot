import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// POST /api/campaigns/whatsapp/[id]/import_params_template - Upload CSV with campaign parameter values
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the form data with the CSV file
    const formData = await request.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organization_id') as string

    // Validate required fields
    if (!organizationId) {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      )
    }

    const url = `${BASE_URL}/broadcast/whatsapp/campaigns/${params.id}/import_params_template/`

    // Create form data for backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)
    backendFormData.append('organization_id', organizationId)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || errorData.message || "Failed to import params template" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error importing params template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
