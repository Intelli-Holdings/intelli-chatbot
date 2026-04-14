/**
 * Utility to extract and detect media from message content
 * Supports both Firebase format ([AUDIO] Media -) and Azure format ([AUDIO] 123456 -)
 */

export interface ExtractedMedia {
  type: "audio" | "video" | "image" | "document" | null
  url: string | null
  displayText: string
  filename: string | null
}

// Shared pattern: [TAG] <filename> - <url>
// Filename can contain spaces, commas, unicode — anything up to " - http"
const MEDIA_PATTERN = (tag: string) =>
  new RegExp(`\\[${tag}\\]\\s+(.+?)\\s+-\\s+(https?:\\/\\/[^\\s]+)`, "i")

// Fallback: [TAG] <filename> with no URL
const MEDIA_NO_URL = (tag: string) =>
  new RegExp(`\\[${tag}\\]\\s+(.+?)\\s*$`, "i")

/**
 * Extract media from message content
 * Returns media type, URL, filename, and the remaining display text
 */
export const extractMedia = (content: string): ExtractedMedia => {
  if (!content) {
    return { type: null, url: null, displayText: "", filename: null }
  }

  const mediaTypes = ["AUDIO", "VIDEO", "IMAGE", "DOCUMENT"] as const
  const typeMap: Record<string, ExtractedMedia["type"]> = {
    AUDIO: "audio",
    VIDEO: "video",
    IMAGE: "image",
    DOCUMENT: "document",
  }

  for (const tag of mediaTypes) {
    // Try pattern with URL first
    const withUrl = content.match(MEDIA_PATTERN(tag))
    if (withUrl) {
      const filename = withUrl[1] || null
      const url = withUrl[2]
      // Remove the entire tag from display text
      const displayText = content.replace(MEDIA_PATTERN(tag), "").trim()
      return { type: typeMap[tag], url, displayText, filename }
    }

    // Try pattern without URL
    const noUrl = content.match(MEDIA_NO_URL(tag))
    if (noUrl) {
      const filename = noUrl[1] || null
      const displayText = content.replace(MEDIA_NO_URL(tag), "").trim()
      return { type: typeMap[tag], url: null, displayText, filename }
    }
  }

  // Direct Azure Blob Storage URL detection
  const azureBlobMatch = content.match(/(https?:\/\/[a-zA-Z0-9]+\.blob\.core\.windows\.net\/[^\s]+)/i)
  if (azureBlobMatch) {
    const url = azureBlobMatch[1]
    const lowerUrl = url.toLowerCase()

    if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lowerUrl)) {
      return { type: "image", url, displayText: "", filename: null }
    }
    if (/\.(mp3|wav|ogg|m4a|aac|opus|webm)(\?|$)/i.test(lowerUrl)) {
      return { type: "audio", url, displayText: "", filename: null }
    }
    if (/\.(mp4|avi|mov|mkv|flv|wmv|3gp|webm)(\?|$)/i.test(lowerUrl)) {
      return { type: "video", url, displayText: "", filename: null }
    }
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|zip|rar)(\?|$)/i.test(lowerUrl)) {
      return { type: "document", url, displayText: "", filename: null }
    }
  }

  return { type: null, url: null, displayText: content, filename: null }
}
