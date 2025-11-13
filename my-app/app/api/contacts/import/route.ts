import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const organization = formData.get("organization") as string

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (!organization) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV and XLSX files are supported" },
        { status: 400 }
      )
    }

    // Create new FormData to forward to backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)
    backendFormData.append("organization", organization)

    // Send file to backend import API
    const response = await fetch(`${BASE_URL}/contacts/imports/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Failed to process file import" }, { status: 500 })
  }
}
