/**
 * Maps Meta/WhatsApp API error codes to human-readable messages
 * with actionable resolution steps.
 */

interface MetaErrorInfo {
  title: string
  description: string
  resolution: string
}

const META_ERROR_CODES: Record<number, MetaErrorInfo> = {
  131042: {
    title: "Payment Issue",
    description: "The WhatsApp Business Account has a payment method problem.",
    resolution: "Add or update the payment method in Meta Business Manager under WhatsApp Accounts > Payment Methods.",
  },
  131030: {
    title: "Invalid Number",
    description: "The recipient's phone number is not registered on WhatsApp.",
    resolution: "Verify the phone number is correct and has WhatsApp installed.",
  },
  131031: {
    title: "Recipient Blocked",
    description: "Your business is not allowed to send messages to this recipient.",
    resolution: "The recipient may have blocked your business or reported it as spam.",
  },
  131047: {
    title: "Conversation Window Expired",
    description: "More than 24 hours have passed since the customer's last message.",
    resolution: "Send a template message to re-engage the customer.",
  },
  131048: {
    title: "Spam Rate Limit",
    description: "Too many messages were sent in a short period.",
    resolution: "Slow down message sending frequency and wait before retrying.",
  },
  131049: {
    title: "Engagement Rate Limit",
    description: "Message was not delivered to maintain ecosystem health.",
    resolution: "This can happen when recipients don't frequently engage. Try again later.",
  },
  131051: {
    title: "Unsupported Message Type",
    description: "The message type is not supported by WhatsApp.",
    resolution: "Check the message format and ensure it follows WhatsApp API guidelines.",
  },
  131052: {
    title: "Media Download Failed",
    description: "WhatsApp could not download the media from the provided URL.",
    resolution: "Ensure the media URL is publicly accessible and not expired.",
  },
  131053: {
    title: "Media Upload Error",
    description: "There was an error uploading the media to WhatsApp.",
    resolution: "Check the media file size, format, and try re-uploading.",
  },
  131026: {
    title: "Recipient Unreachable",
    description: "The message could not be delivered to the recipient.",
    resolution: "The recipient's phone may be off, out of service, or WhatsApp is not active.",
  },
  130472: {
    title: "Phone Rate Limit",
    description: "Too many messages have been sent to this phone number.",
    resolution: "Wait before sending more messages to this recipient.",
  },
  368: {
    title: "Account Restricted",
    description: "Your business account has been temporarily restricted.",
    resolution: "Review Meta Business Manager for policy violation notices and address them.",
  },
  131056: {
    title: "Pair Rate Limit",
    description: "The business is restricted from sending messages temporarily.",
    resolution: "Wait and try again later. Consider reducing message volume.",
  },
}

export function getMetaErrorInfo(errorCode?: number | string | null): MetaErrorInfo | null {
  if (!errorCode) return null
  const code = typeof errorCode === 'string' ? parseInt(errorCode, 10) : errorCode
  if (isNaN(code)) return null
  return META_ERROR_CODES[code] || null
}

export function getHumanReadableError(errorInfo?: {
  error?: string
  error_type?: string
  error_code?: number | string
  error_subcode?: number | string
  error_details?: string
} | null): string {
  if (!errorInfo) return 'Unknown error'

  // Try to get a mapped description first
  const mapped = getMetaErrorInfo(errorInfo.error_code)
  if (mapped) return mapped.description

  // Fall back to the raw error message
  if (errorInfo.error_details) return errorInfo.error_details
  if (errorInfo.error && errorInfo.error !== 'Unknown error') return errorInfo.error

  return 'Message delivery failed. Check Meta Business Manager for details.'
}

export function getErrorResolution(errorCode?: number | string | null): string | null {
  const info = getMetaErrorInfo(errorCode)
  return info?.resolution || null
}
