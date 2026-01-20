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
}

export type MetaWebhookEntry = {
  id: string
  time: number
  messaging?: MetaMessagingEvent[]
}

export type MetaWebhookPayload = {
  object: "page" | "instagram"
  entry: MetaWebhookEntry[]
}
