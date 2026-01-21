/**
 * Instagram API Helper Functions
 * Utility functions for interacting with Instagram Graph API
 */

const INSTAGRAM_API_VERSION = "v21.0"
const INSTAGRAM_GRAPH_BASE_URL = "https://graph.instagram.com"

export interface InstagramMessage {
  recipient: {
    id: string // Instagram-scoped ID (IGSID)
  }
  message: {
    text?: string
    attachment?: {
      type: "image" | "video" | "audio" | "file"
      payload: {
        url?: string
        is_reusable?: boolean
      }
    }
  }
}

export interface InstagramMessageResponse {
  recipient_id: string
  message_id: string
}

export interface InstagramUserProfile {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  follower_count?: number
  follows_count?: number
  media_count?: number
}

/**
 * Send a message via Instagram Graph API
 */
export async function sendInstagramMessage(
  accessToken: string,
  message: InstagramMessage
): Promise<InstagramMessageResponse> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_API_VERSION}/me/messages`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to send Instagram message")
  }

  return data
}

/**
 * Get Instagram user profile information
 */
export async function getInstagramUserProfile(
  accessToken: string,
  fields: string[] = ["id", "username", "name", "profile_picture_url"]
): Promise<InstagramUserProfile> {
  const fieldsParam = fields.join(",")
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/me?fields=${fieldsParam}&access_token=${accessToken}`

  const response = await fetch(url, {
    method: "GET",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch Instagram user profile")
  }

  return data
}

/**
 * Get Instagram Business Account insights
 */
export async function getInstagramInsights(
  accessToken: string,
  igUserId: string,
  metrics: string[] = ["impressions", "reach", "profile_views"],
  period: "day" | "week" | "days_28" = "day"
): Promise<any> {
  const metricsParam = metrics.join(",")
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_API_VERSION}/${igUserId}/insights?metric=${metricsParam}&period=${period}&access_token=${accessToken}`

  const response = await fetch(url, {
    method: "GET",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch Instagram insights")
  }

  return data
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appSecret: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`

  const response = await fetch(url, {
    method: "GET",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to exchange token")
  }

  return data
}

/**
 * Refresh a long-lived token (extends expiration by 60 days)
 */
export async function refreshLongLivedToken(
  longLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`

  const response = await fetch(url, {
    method: "GET",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to refresh token")
  }

  return data
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(
  accessToken: string,
  conversationId: string,
  limit: number = 10
): Promise<any> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_API_VERSION}/${conversationId}?fields=messages{message,from,created_time}&limit=${limit}&access_token=${accessToken}`

  const response = await fetch(url, {
    method: "GET",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch conversation messages")
  }

  return data
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(accessToken: string, messageId: string): Promise<boolean> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_API_VERSION}/me/messages`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: messageId },
      sender_action: "mark_seen",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to mark message as read")
  }

  return data.success || true
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(
  accessToken: string,
  recipientId: string,
  action: "typing_on" | "typing_off" = "typing_on"
): Promise<boolean> {
  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_API_VERSION}/me/messages`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      sender_action: action,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to send typing indicator")
  }

  return data.success || true
}

/**
 * Helper to construct Instagram OAuth URL
 */
export function getInstagramOAuthURL(
  appId: string,
  redirectUri: string,
  scopes: string[] = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
  ]
): string {
  const url = new URL("https://api.instagram.com/oauth/authorize")
  url.searchParams.set("client_id", appId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", scopes.join(","))

  return url.toString()
}

/**
 * Validate Instagram webhook signature
 */
export function validateInstagramWebhookSignature(
  payload: string,
  signature: string | null,
  appSecret: string
): boolean {
  if (!signature) return false

  const crypto = require("crypto")
  const expectedSignature = crypto.createHmac("sha256", appSecret).update(payload).digest("hex")

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.startsWith("sha256=") ? signature.slice(7) : signature

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(cleanSignature))
}
