"use client"

import { useCallback } from "react"
import { useQueryClient } from "react-query"
import type { ChatMessage } from "@/app/dashboard/conversations/components/types"

const fetchConversationMessages = async (phoneNumber: string, customerNumber: string): Promise<ChatMessage[]> => {
  const response = await fetch(
    `/api/appservice/paginated/conversations/whatsapp/chat_sessions/${phoneNumber}/${customerNumber}/`,
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch conversation messages")
  }

  const data = await response.json()
  const messages = (data.results || []).map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    answer: msg.answer,
    created_at: msg.created_at,
    sender: msg.sender || "ai",
    reaction: msg.reaction,
    whatsapp_message_id: msg.whatsapp_message_id,
    status: msg.status,
  }))

  return messages.reverse()
}

export function useWhatsAppChatMessages(phoneNumber?: string) {
  const queryClient = useQueryClient()

  const getCachedMessages = useCallback(
    (customerNumber: string): ChatMessage[] =>
      (queryClient.getQueryData(["whatsapp-chat-messages", phoneNumber, customerNumber]) as ChatMessage[]) || [],
    [phoneNumber, queryClient],
  )

  const setCachedMessages = useCallback(
    (customerNumber: string, messages: ChatMessage[]) => {
      queryClient.setQueryData(["whatsapp-chat-messages", phoneNumber, customerNumber], messages)
    },
    [phoneNumber, queryClient],
  )

  const fetchMessages = useCallback(
    async (customerNumber: string): Promise<ChatMessage[]> => {
      if (!phoneNumber) return []
      return queryClient.fetchQuery(
        ["whatsapp-chat-messages", phoneNumber, customerNumber],
        () => fetchConversationMessages(phoneNumber, customerNumber),
        { staleTime: 15 * 1000 },
      )
    },
    [phoneNumber, queryClient],
  )

  return {
    fetchMessages,
    getCachedMessages,
    setCachedMessages,
  }
}
