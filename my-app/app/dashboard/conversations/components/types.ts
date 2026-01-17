export interface ChatMessage {
  [x: string]: any
  id: number
  content: string | null
  answer: string | null
  created_at: string
  sender: string
  imageUrl?: string
  whatsapp_message_id?: string // WhatsApp message ID (wamid) for reactions
  reaction?: {
    emoji: string
    reactor_id?: string
    created_at?: string
  }
  // Message status for WhatsApp-style indicators
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  read?: boolean
  pending?: boolean // Flag for optimistic messages before server confirmation
}

export interface Conversation {
  id: number
  customer_number: string
  customer_name?: string
  messages?: ChatMessage[]
  message_counter?: number
  is_handle_by_human?: boolean
  updated_at: string
  phone_number: string
  recipient_id: string
  unread_messages?: number
  attachments?: {
    id: number
    media_name: string
    media_type: string
    media_url: string
    media_mime_type: string
    created_at: string
  }[]
}

export interface Sentiment {
  id: number
  content: string
  sentiment: string[]
}

export interface SentimentAnalysis {
  chatsession: {
    id: number
    customer_number: string
    updated_at: string
  }
  sentiments: {
    result: Sentiment[]
  }
  created_at: string
}

export interface MediaType {
  type: "image" | "audio" | "video" | "document" | "file"
  url: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
}
