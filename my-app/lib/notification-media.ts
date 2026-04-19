export type NotificationMediaType = 'image' | 'video' | 'audio' | 'document'

export interface NotificationMediaInfo {
  type: NotificationMediaType | null
  url: string
  text: string
  fileName?: string
}

/**
 * Match `[TAG] <filename> - <url>`. Filename may contain spaces, dots,
 * semicolons, codec parameters, etc. — we accept anything up to the ` - http`
 * separator. Case-insensitive on the tag.
 */
const taggedWithUrl = (tag: string) =>
  new RegExp(`\\[${tag}\\]\\s+(.+?)\\s+-\\s+(https?:\\/\\/[^\\s]+)`, 'i')

/** Fallback: bare `[TAG] <filename>` with no URL. */
const taggedNoUrl = (tag: string) =>
  new RegExp(`\\[${tag}\\]\\s*(.+?)?\\s*$`, 'im')

const TAG_TO_TYPE: Record<string, NotificationMediaType> = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
}

export function extractMediaFromMessage(message: string | null | undefined): NotificationMediaInfo {
  if (!message) return { type: null, url: '', text: '' }

  // "The customer shared an image. Download URL: https://..."
  const sharedMediaMatch = message.match(
    /customer shared (?:an?|the)\s+(image|audio|video|document|file).*?Download URL:\s*(https?:\/\/[^\s]+)/i,
  )
  if (sharedMediaMatch) {
    const rawType = sharedMediaMatch[1].toLowerCase()
    const type: NotificationMediaType = rawType === 'file' ? 'document' : (rawType as NotificationMediaType)
    return { type, url: sharedMediaMatch[2].replace(/\.$/, ''), text: '' }
  }

  // `[TAG] filename - url` — try each tag, long filename tolerated.
  for (const tag of Object.keys(TAG_TO_TYPE)) {
    const withUrl = message.match(taggedWithUrl(tag))
    if (withUrl) {
      const fileName = withUrl[1]?.trim() || undefined
      const url = withUrl[2].replace(/[.,]$/, '')
      const text = message.replace(taggedWithUrl(tag), '').trim()
      return { type: TAG_TO_TYPE[tag], url, text, fileName }
    }
  }

  // Bare `[TAG] filename` with no URL attached.
  for (const tag of Object.keys(TAG_TO_TYPE)) {
    const noUrl = message.match(taggedNoUrl(tag))
    if (noUrl) {
      const fileName = noUrl[1]?.trim() || undefined
      const text = message.replace(taggedNoUrl(tag), '').trim()
      return { type: TAG_TO_TYPE[tag], url: '', text, fileName }
    }
  }

  // Raw image URL in the body (no tag) — treat as image.
  const imageUrlMatch = message.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp))/i)
  if (imageUrlMatch) {
    return {
      type: 'image',
      url: imageUrlMatch[0],
      text: message.replace(imageUrlMatch[0], '').trim(),
    }
  }

  return { type: null, url: '', text: message }
}

export const MEDIA_LABELS: Record<NotificationMediaType, string> = {
  image: '📷 Image',
  video: '🎥 Video',
  audio: '🎵 Audio',
  document: '📄 Document',
}
