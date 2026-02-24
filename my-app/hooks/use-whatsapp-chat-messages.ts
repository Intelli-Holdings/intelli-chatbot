"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "react-query"
import type { ChatMessage } from "@/app/dashboard/conversations/components/types"

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: ChatMessage[]
}

const fetchConversationMessages = async (
  phoneNumber: string,
  customerNumber: string,
  pageUrl?: string,
  _retryCount: number = 0
): Promise<PaginatedResponse> => {
  const url =
    pageUrl || `/api/appservice/paginated/conversations/whatsapp/chat_sessions/${phoneNumber}/${customerNumber}/`

  const response = await fetch(url)

  // Retry once on 429 (rate limited)
  if (response.status === 429 && _retryCount < 2) {
    const retryAfter = response.headers.get("Retry-After")
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : (_retryCount + 1) * 2000
    await new Promise(resolve => setTimeout(resolve, waitMs))
    return fetchConversationMessages(phoneNumber, customerNumber, pageUrl, _retryCount + 1)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      response.status === 429
        ? "Too many requests. Please wait a moment."
        : errorData.error || "Failed to fetch conversation messages"
    )
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

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: messages.reverse(), // Reverse to show oldest first
  }
}

export function useWhatsAppChatMessages(phoneNumber?: string) {
  const queryClient = useQueryClient()
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const getCachedMessages = useCallback(
    (customerNumber: string): ChatMessage[] => {
      const cached = queryClient.getQueryData(["whatsapp-chat-messages", phoneNumber, customerNumber])
      return Array.isArray(cached) ? (cached as ChatMessage[]) : []
    },
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

      const data = await queryClient.fetchQuery(
        ["whatsapp-chat-messages", phoneNumber, customerNumber],
        () => fetchConversationMessages(phoneNumber, customerNumber),
        { staleTime: 15 * 1000 },
      )

      setNextPageUrl(data.next)
      setHasMore(!!data.next)

      return data.results
    },
    [phoneNumber, queryClient],
  )

  const fetchOlderMessages = useCallback(
    async (customerNumber: string): Promise<ChatMessage[]> => {
      if (!phoneNumber || !nextPageUrl || isLoadingMore) return []

      setIsLoadingMore(true)

      try {
        const data = await fetchConversationMessages(phoneNumber, customerNumber, nextPageUrl)

        setNextPageUrl(data.next)
        setHasMore(!!data.next)

        // Prepend older messages to existing ones
        const existingMessages = getCachedMessages(customerNumber)
        const updatedMessages = [...data.results, ...existingMessages]
        setCachedMessages(customerNumber, updatedMessages)

        return data.results
      } finally {
        setIsLoadingMore(false)
      }
    },
    [phoneNumber, nextPageUrl, isLoadingMore, getCachedMessages, setCachedMessages],
  )

  const resetPagination = useCallback(() => {
    setNextPageUrl(null)
    setHasMore(true)
    setIsLoadingMore(false)
  }, [])

  return {
    fetchMessages,
    fetchOlderMessages,
    getCachedMessages,
    setCachedMessages,
    hasMore,
    isLoadingMore,
    resetPagination,
  }
}
