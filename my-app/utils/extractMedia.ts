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

  // Audio pattern: [AUDIO] Media/ID - URL or [AUDIO] 837415822316117 - URL
  const audioMatch = content.match(/\[AUDIO\]\s+(?:Media|\d+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (audioMatch) {
    const url = audioMatch[1] || null
    return {
      type: "audio",
      url: url,
      displayText: url ? "" : content, // Show content only if no URL
    }
  }

  // Image pattern: [IMAGE] Media/ID - URL or [IMAGE] 835637205492111 - URL (with or without URL)
  const imageMatch = content.match(/\[IMAGE\]\s+(?:Media|\d+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (imageMatch) {
    const url = imageMatch[1] || null
    return {
      type: "image",
      url: url,
      displayText: url ? "" : content, // Show content only if no URL
    }
  }

  // Video pattern: [VIDEO] Media/ID - URL or [VIDEO] 123456 - URL
  const videoMatch = content.match(/\[VIDEO\]\s+(?:Media|\d+)(?:\s+-\s+(https?:\/\/[^\s]+))?/i)
  if (videoMatch) {
    const url = videoMatch[1] || null
    return {
      type: "video",
      url: url,
      displayText: url ? "" : content, // Show content only if no URL
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
