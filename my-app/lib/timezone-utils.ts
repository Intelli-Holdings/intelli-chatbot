/**
 * Timezone utility functions for consistent time handling
 * All times are stored in UTC in the backend
 * Frontend captures user's local timezone and converts appropriately
 */

/**
 * Convert local datetime-local input to UTC ISO string
 */
export function convertLocalToUTC(localDateTimeString: string): string {
  if (!localDateTimeString) return ""

  const localDate = new Date(localDateTimeString)
  return localDate.toISOString()
}

/**
 * Convert UTC ISO string to local datetime-local format for input fields
 */
export function convertUTCToLocalDateTimeString(utcIsoString: string): string {
  if (!utcIsoString) return ""

  const date = new Date(utcIsoString)
  return date.toISOString().slice(0, 16)
}

/**
 * Format UTC time for display with user's local timezone
 */
export function formatUTCForDisplay(utcIsoString: string): string {
  if (!utcIsoString) return ""

  const date = new Date(utcIsoString)
  const localTimeString = date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  const tzOffset = -date.getTimezoneOffset()
  const tzHours = Math.floor(Math.abs(tzOffset) / 60)
  const tzMinutes = Math.abs(tzOffset) % 60
  const tzSign = tzOffset >= 0 ? "+" : "-"
  const tzString = `GMT${tzSign}${tzHours}${tzMinutes > 0 ? ":" + tzMinutes.toString().padStart(2, "0") : ""}`

  return `${localTimeString} (${tzString})`
}

/**
 * Format UTC time with just local time (no timezone suffix)
 */
export function formatUTCTimeOnly(utcIsoString: string): string {
  if (!utcIsoString) return ""

  const date = new Date(utcIsoString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbr(): string {
  const date = new Date()
  return date.toLocaleString("en-US", { timeZoneName: "short" }).split(" ").pop() || "UTC"
}
