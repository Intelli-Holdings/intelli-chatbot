export type NotificationMediaType = 'image' | 'video' | 'audio' | 'document'

export interface NotificationMediaInfo {
  type: NotificationMediaType | null
  url: string
  text: string
  fileName?: string
}

export function extractMediaFromMessage(message: string | null | undefined): NotificationMediaInfo {
  if (!message) return { type: null, url: '', text: '' }

  const sharedMediaMatch = message.match(
    /customer shared (?:an?|the)\s+(image|audio|video|document|file).*?Download URL:\s*(https?:\/\/[^\s]+)/i,
  )
  if (sharedMediaMatch) {
    const rawType = sharedMediaMatch[1].toLowerCase()
    const type: NotificationMediaType = rawType === 'file' ? 'document' : (rawType as NotificationMediaType)
    return { type, url: sharedMediaMatch[2], text: '' }
  }

  const imageMatch = message.match(/\[IMAGE\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
  const audioMatch = message.match(/\[AUDIO\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
  const videoMatch = message.match(/\[VIDEO\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
  const documentMatch = message.match(/\[DOCUMENT\]\s*([^\s\]]+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)

  if (imageMatch) {
    return {
      type: 'image',
      url: imageMatch[2] || '',
      text: message.replace(/\[IMAGE\][^\n]*/gi, '').trim(),
    }
  }
  if (audioMatch) {
    return {
      type: 'audio',
      url: audioMatch[2] || '',
      text: message.replace(/\[AUDIO\][^\n]*/gi, '').trim(),
    }
  }
  if (videoMatch) {
    return {
      type: 'video',
      url: videoMatch[2] || '',
      text: message.replace(/\[VIDEO\][^\n]*/gi, '').trim(),
    }
  }
  if (documentMatch) {
    return {
      type: 'document',
      url: documentMatch[2] || '',
      fileName: documentMatch[1] || 'Document',
      text: message.replace(/\[DOCUMENT\][^\n]*/gi, '').trim(),
    }
  }

  const urlMatch = message.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp))/i)
  if (urlMatch) {
    return {
      type: 'image',
      url: urlMatch[0],
      text: message.replace(urlMatch[0], '').trim(),
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
