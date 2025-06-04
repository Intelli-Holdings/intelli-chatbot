import { type NextRequest, NextResponse } from "next/server"

// Define common types
export type TemplateCategory = "UTILITY" | "MARKETING" | "AUTHENTICATION"
export type HeaderFormat = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | "NONE"
export type ButtonType =
  | "QUICK_REPLY"
  | "URL"
  | "PHONE_NUMBER"
  | "OTP"
  | "MPM"
  | "CATALOG"
  | "FLOW"
  | "VOICE_CALL"
  | "APP"
export type OtpType = "COPY_CODE" | "ONE_TAP" | "ZERO_TAP"

export type TemplateStatus = "APPROVED" | "PENDING" | "REJECTED" | "ACTIVE" | "PAUSED" | "DISABLED"

// Template component types
export interface HeaderComponent {
  type: "HEADER"
  format: HeaderFormat
  text?: string
  example?: {
    header_text?: string[]
    header_handle?: string[]
  }
}

export interface BodyComponent {
  type: "BODY"
  text?: string
  example?: {
    body_text?: string[][]
  }
  add_security_recommendation?: boolean
  add_contact_number?: boolean
  add_learn_more_link?: boolean
  add_track_package_link?: boolean
}

export interface FooterComponent {
  type: "FOOTER"
  text?: string
  code_expiration_minutes?: number
}

export interface ButtonComponent {
  type: "BUTTONS"
  buttons: Button[]
}

export interface Button {
  type: ButtonType
  text: string
  phone_number?: string
  url?: string
  example?: string[]
  otp_type?: OtpType
  autofill_text?: string
  package_name?: string
  signature_hash?: string
  zero_tap_terms_accepted?: boolean
  supported_apps?: {
    package_name: string
    signature_hash: string
  }[]
}

export type TemplateComponent = HeaderComponent | BodyComponent | FooterComponent | ButtonComponent

// Template creation request
export interface CreateTemplateRequest {
  name: string
  language: string
  category: TemplateCategory
  parameter_format?: "NAMED" | "POSITIONAL"
  components: TemplateComponent[]
  message_send_ttl_seconds?: number | -1
}

// Template response
export interface TemplateResponse {
  id: string
  status: TemplateStatus
  category: TemplateCategory
  name?: string
  language?: string
  components?: TemplateComponent[]
  created_time?: string
  rejected_reason?: string
}

// Template list response
export interface TemplateListResponse {
  data: TemplateResponse[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// API version
const API_VERSION = "v22.0"

// Helper function to get access token from request
function getAccessToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header")
  }
  return authHeader.substring(7)
}

// Helper function to get WABA ID from request
function getWabaId(request: NextRequest): string {
  const wabaId = request.nextUrl.searchParams.get("waba_id")
  if (!wabaId) {
    throw new Error("Missing waba_id parameter")
  }
  return wabaId
}

// GET /api/whatsapp/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    const wabaId = getWabaId(request)

    // Get query parameters
    const templateName = request.nextUrl.searchParams.get("name")
    const templateId = request.nextUrl.searchParams.get("template_id")
    const fields = request.nextUrl.searchParams.get("fields")
    const limit = request.nextUrl.searchParams.get("limit")
    const status = request.nextUrl.searchParams.get("status")

    let url: string

    if (templateId) {
      // Get template by ID
      url = `https://graph.facebook.com/${API_VERSION}/${templateId}`
    } else if (templateName) {
      // Get template by name
      url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates?name=${templateName}`
    } else {
      // Get all templates
      const queryParams = new URLSearchParams()

      if (fields) queryParams.append("fields", fields)
      if (limit) queryParams.append("limit", limit)
      if (status) queryParams.append("status", status)

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to fetch templates" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/whatsapp/templates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

// POST /api/whatsapp/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    const wabaId = getWabaId(request)

    const templateData: CreateTemplateRequest = await request.json()

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to create template" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/whatsapp/templates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

// PUT /api/whatsapp/templates - Edit a template
export async function PUT(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    const templateId = request.nextUrl.searchParams.get("template_id")

    if (!templateId) {
      return NextResponse.json({ error: "Missing template_id parameter" }, { status: 400 })
    }

    const templateData: Partial<CreateTemplateRequest> = await request.json()

    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${templateId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to edit template" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/whatsapp/templates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

// DELETE /api/whatsapp/templates - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    const wabaId = getWabaId(request)

    const templateName = request.nextUrl.searchParams.get("name")
    const templateId = request.nextUrl.searchParams.get("hsm_id")

    if (!templateName) {
      return NextResponse.json({ error: "Missing name parameter" }, { status: 400 })
    }

    let url: string
    if (templateId) {
      // Delete by ID
      url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates?hsm_id=${templateId}&name=${templateName}`
    } else {
      // Delete by name
      url = `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates?name=${templateName}`
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to delete template" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in DELETE /api/whatsapp/templates:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
