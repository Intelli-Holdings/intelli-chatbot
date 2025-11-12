/**
 * Utility to extract and detect media from message content
 * Supports both Firebase format ([AUDIO] Media -) and Azure format ([AUDIO] 123456 -)
 */

export interface ExtractedMedia {
  type: "audio" | "video" | "image" | null
  url: string | null
  displayText: string
}

/**
 * Extract media from message content
 * Returns media type, URL, and the remaining display text
 */
export const extractMedia = (content: string): ExtractedMedia => {
  if (!content) {
    return { type: null, url: null, displayText: "" }
  }

  // Audio pattern: [AUDIO] Media/ID - URL or [AUDIO] 837415822316117 - URL or [AUDIO] filename.ext - URL
  const audioMatch = content.match(/\[AUDIO\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (audioMatch) {
    const url = audioMatch[1] || null
    // Remove the [AUDIO] tag and URL from display text
    const displayText = content.replace(/\[AUDIO\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "").trim()
    return {
      type: "audio",
      url: url,
      displayText: displayText || "", // Show remaining text if any
    }
  }

  // Image pattern: [IMAGE] Media/ID/filename - URL or [IMAGE] 835637205492111 - URL (with or without URL)
  const imageMatch = content.match(/\[IMAGE\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (imageMatch) {
    const url = imageMatch[1] || null
    // Remove the [IMAGE] tag and URL from display text
    const displayText = content.replace(/\[IMAGE\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "").trim()
    return {
      type: "image",
      url: url,
      displayText: displayText || "", // Show remaining text if any
    }
  }

  // Video pattern: [VIDEO] Media/ID/filename - URL or [VIDEO] 123456 - URL
  const videoMatch = content.match(/\[VIDEO\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (videoMatch) {
    const url = videoMatch[1] || null
    // Remove the [VIDEO] tag and URL from display text
    const displayText = content.replace(/\[VIDEO\]\s+(?:Media|[\w_.-]+)(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "").trim()
    return {
      type: "video",
      url: url,
      displayText: displayText || "", // Show remaining text if any
    }
  }

  // Direct Azure Blob Storage URL detection
  const azureBlobMatch = content.match(/(https?:\/\/[a-zA-Z0-9]+\.blob\.core\.windows\.net\/[^\s]+)/i)
  if (azureBlobMatch) {
    const url = azureBlobMatch[1]
    const lowerUrl = url.toLowerCase()

    // Determine media type from URL extension
    if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lowerUrl)) {
      return {
        type: "image",
        url: url,
        displayText: content,
      }
    }

    if (/\.(mp3|wav|ogg|m4a|aac|opus|webm)(\?|$)/i.test(lowerUrl)) {
      return {
        type: "audio",
        url: url,
        displayText: content,
      }
    }

    if (/\.(mp4|avi|mov|mkv|flv|wmv|3gp|webm)(\?|$)/i.test(lowerUrl)) {
      return {
        type: "video",
        url: url,
        displayText: content,
      }
    }
  }

  return { type: null, url: null, displayText: content }
}
