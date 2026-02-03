export type MetaMessagingEvent = {
  sender?: { id: string }
  recipient?: { id: string }
  timestamp?: number
  message?: {
    mid?: string
    text?: string
  }
  postback?: {
    title?: string
    payload?: string
  }
  read?: {
    watermark?: number
  }
  delivery?: {
    mids?: string[]
    watermark?: number
  }
}

export type MetaWebhookEntry = {
  id: string
  time: number
  messaging?: MetaMessagingEvent[]
  changes?: {
    field: string
    value: unknown
  }[]
}

export type MetaWebhookPayload = {
  object: "page" | "instagram"
  entry: MetaWebhookEntry[]
}
