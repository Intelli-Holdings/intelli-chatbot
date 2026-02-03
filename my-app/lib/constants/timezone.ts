/**
 * Timezone constants and defaults
 */

export const TIMEZONE_CONFIG = {
  // Default display format for scheduled times
  DATE_FORMAT: "MM/dd/yyyy",
  TIME_FORMAT: "HH:mm",

  // ISO 8601 is the standard for API communication
  API_FORMAT: "ISO8601", // Always UTC

  // User-facing format
  DISPLAY_FORMAT: "MMM dd, yyyy h:mm a z",
}

export const TIMEZONE_STORAGE = {
  // All times stored in backend are UTC
  BACKEND_TIMEZONE: "UTC",

  // Frontend uses browser's local timezone
  FRONTEND_TIMEZONE: "LOCAL",
}
