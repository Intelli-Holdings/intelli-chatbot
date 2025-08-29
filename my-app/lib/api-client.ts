// Client-side API functions for the WhatsApp Template Manager

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

// Namespace response
export interface NamespaceResponse {
  id: string
  message_template_namespace: string
}

// Base API configuration
const API_BASE = "/api/whatsapp"

// Helper function to create headers with access token
function createHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }
}

/**
 * Get a template by ID
 */
export async function getTemplateById(templateId: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/templates?template_id=${templateId}`, {
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch template")
    }

    return (await response.json()) as TemplateResponse
  } catch (error) {
    console.error("Error fetching template by ID:", error)
    throw error
  }
}

/**
 * Get a template by name
 */
export async function getTemplateByName(wabaId: string, templateName: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/templates?waba_id=${wabaId}&name=${templateName}`, {
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch template by name")
    }

    return (await response.json()) as TemplateListResponse
  } catch (error) {
    console.error("Error fetching template by name:", error)
    throw error
  }
}

/**
 * Get all templates with default fields
 */
export async function getAllTemplates(
  wabaId: string,
  accessToken: string,
  options: { fields?: string; limit?: number; status?: string } = {},
) {
  try {
    const queryParams = new URLSearchParams({ waba_id: wabaId })

    if (options.fields) queryParams.append("fields", options.fields)
    if (options.limit) queryParams.append("limit", options.limit.toString())
    if (options.status) queryParams.append("status", options.status)

    const response = await fetch(`${API_BASE}/templates?${queryParams.toString()}`, {
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch templates")
    }

    return (await response.json()) as TemplateListResponse
  } catch (error) {
    console.error("Error fetching all templates:", error)
    throw error
  }
}

/**
 * Get template namespace
 */
export async function getTemplateNamespace(wabaId: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/namespace?waba_id=${wabaId}`, {
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch namespace")
    }

    return (await response.json()) as NamespaceResponse
  } catch (error) {
    console.error("Error fetching namespace:", error)
    throw error
  }
}

/**
 * Create a template
 */
export async function createTemplate(wabaId: string, templateData: CreateTemplateRequest, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/templates?waba_id=${wabaId}`, {
      method: "POST",
      headers: createHeaders(accessToken),
      body: JSON.stringify(templateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create template")
    }

    return (await response.json()) as TemplateResponse
  } catch (error) {
    console.error("Error creating template:", error)
    throw error
  }
}

/**
 * Edit a template
 */
export async function editTemplate(
  templateId: string,
  templateData: Partial<CreateTemplateRequest>,
  accessToken: string,
) {
  try {
    const response = await fetch(`${API_BASE}/templates?template_id=${templateId}`, {
      method: "PUT",
      headers: createHeaders(accessToken),
      body: JSON.stringify(templateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to edit template")
    }

    return await response.json()
  } catch (error) {
    console.error("Error editing template:", error)
    throw error
  }
}

/**
 * Delete a template by name
 */
export async function deleteTemplateByName(wabaId: string, templateName: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE}/templates?waba_id=${wabaId}&name=${templateName}`, {
      method: "DELETE",
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete template")
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting template by name:", error)
    throw error
  }
}

/**
 * Delete a template by ID
 */
export async function deleteTemplateById(
  wabaId: string,
  templateId: string,
  templateName: string,
  accessToken: string,
) {
  try {
    const response = await fetch(`${API_BASE}/templates?waba_id=${wabaId}&hsm_id=${templateId}&name=${templateName}`, {
      method: "DELETE",
      headers: createHeaders(accessToken),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete template")
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting template by ID:", error)
    throw error
  }
}

/**
 * Send a test message using a template
 */
export async function sendTestMessage(
  phoneNumberId: string,
  recipientNumber: string,
  templateName: string,
  language: string,
  namespace: string,
  components: any[],
  accessToken: string,
) {
  try {
    const response = await fetch(`${API_BASE}/messages?phone_number_id=${phoneNumberId}`, {
      method: "POST",
      headers: createHeaders(accessToken),
      body: JSON.stringify({
        to: recipientNumber,
        template: {
          name: templateName,
          language: language,
          namespace: namespace,
          components: components,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to send test message")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending test message:", error)
    throw error
  }
}

/**
 * Create authentication template with OTP copy code button
 */
export async function createAuthTemplateWithCopyCode(
  wabaId: string,
  templateName: string,
  language: string,
  accessToken: string,
  codeExpirationMinutes = 10,
) {
  const templateData: CreateTemplateRequest = {
    name: templateName,
    language: language,
    category: "AUTHENTICATION",
    components: [
      {
        type: "BODY",
        add_security_recommendation: true,
      },
      {
        type: "FOOTER",
        code_expiration_minutes: codeExpirationMinutes,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "OTP",
            otp_type: "COPY_CODE",
            text: "Copy Code",
          },
        ],
      },
    ],
  }

  return createTemplate(wabaId, templateData, accessToken)
}

/**
 * Create authentication template with one-tap auto-fill button
 */
export async function createAuthTemplateWithOneTap(
  wabaId: string,
  templateName: string,
  language: string,
  packageName: string,
  signatureHash: string,
  accessToken: string,
  codeExpirationMinutes = 10,
) {
  const templateData: CreateTemplateRequest = {
    name: templateName,
    language: language,
    category: "AUTHENTICATION",
    components: [
      {
        type: "BODY",
        add_security_recommendation: true,
      },
      {
        type: "FOOTER",
        code_expiration_minutes: codeExpirationMinutes,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "OTP",
            otp_type: "ONE_TAP",
            text: "Copy Code",
            autofill_text: "Autofill",
            package_name: packageName,
            signature_hash: signatureHash,
          },
        ],
      },
    ],
  }

  return createTemplate(wabaId, templateData, accessToken)
}

/**
 * Create catalog template
 */
export async function createCatalogTemplate(
  wabaId: string,
  templateName: string,
  language: string,
  bodyText: string,
  footerText: string,
  bodyExamples: string[][],
  accessToken: string,
) {
  const templateData: CreateTemplateRequest = {
    name: templateName,
    language: language,
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: bodyText,
        example: {
          body_text: bodyExamples,
        },
      },
      {
        type: "FOOTER",
        text: footerText,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "CATALOG",
            text: "View catalog",
          },
        ],
      },
    ],
  }

  return createTemplate(wabaId, templateData, accessToken)
}
