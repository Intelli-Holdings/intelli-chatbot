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
  instagramAccountId: string,
  customerId: string,
  pageUrl?: string,
  _retryCount: number = 0
): Promise<PaginatedResponse> => {
  const url =
    pageUrl || `/api/appservice/paginated/conversations/instagram/chat_sessions/${instagramAccountId}/${customerId}/`

  const response = await fetch(url)

  if (response.status === 429 && _retryCount < 2) {
    const retryAfter = response.headers.get("Retry-After")
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : (_retryCount + 1) * 2000
    await new Promise(resolve => setTimeout(resolve, waitMs))
    return fetchConversationMessages(instagramAccountId, customerId, pageUrl, _retryCount + 1)
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
    whatsapp_message_id: msg.wmessage_id,
    incoming_whatsapp_message_id: msg.incoming_wmessage_id,
    status: msg.status,
  }))

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: messages.reverse(),
  }
}

export function useInstagramChatMessages(instagramAccountId?: string) {
  const queryClient = useQueryClient()
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const getCachedMessages = useCallback(
    (customerId: string): ChatMessage[] => {
      const cached = queryClient.getQueryData(["instagram-chat-messages", instagramAccountId, customerId])
      return Array.isArray(cached) ? (cached as ChatMessage[]) : []
    },
    [instagramAccountId, queryClient],
  )

  const setCachedMessages = useCallback(
    (customerId: string, messages: ChatMessage[]) => {
      queryClient.setQueryData(["instagram-chat-messages", instagramAccountId, customerId], messages)
    },
    [instagramAccountId, queryClient],
  )

  const fetchMessages = useCallback(
    async (customerId: string): Promise<ChatMessage[]> => {
      if (!instagramAccountId) return []

      const data = await queryClient.fetchQuery(
        ["instagram-chat-messages", instagramAccountId, customerId],
        () => fetchConversationMessages(instagramAccountId, customerId),
        { staleTime: 15 * 1000 },
      )

      setNextPageUrl(data.next)
      setHasMore(!!data.next)

      return data.results
    },
    [instagramAccountId, queryClient],
  )

  const fetchOlderMessages = useCallback(
    async (customerId: string): Promise<ChatMessage[]> => {
      if (!instagramAccountId || !nextPageUrl || isLoadingMore) return []

      setIsLoadingMore(true)

      try {
        const data = await fetchConversationMessages(instagramAccountId, customerId, nextPageUrl)

        setNextPageUrl(data.next)
        setHasMore(!!data.next)

        const existingMessages = getCachedMessages(customerId)
        const updatedMessages = [...data.results, ...existingMessages]
        setCachedMessages(customerId, updatedMessages)

        return data.results
      } finally {
        setIsLoadingMore(false)
      }
    },
    [instagramAccountId, nextPageUrl, isLoadingMore, getCachedMessages, setCachedMessages],
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
