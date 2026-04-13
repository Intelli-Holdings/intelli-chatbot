"use client"

import { useQuery, useQueryClient } from "react-query"
import { ChatbotAutomationService } from "@/services/chatbot-automation"
import type { ChatbotAutomation } from "@/types/chatbot-automation"

const STALE_TIME_MS = 30 * 1000
const CACHE_TIME_MS = 5 * 60 * 1000

export const chatbotsQueryKey = (organizationId?: string) =>
  ["chatbots", organizationId] as const

/**
 * React-query backed hook for the dashboard chatbots list.
 *
 * Mirrors the caching pattern used by use-whatsapp-chat-sessions and
 * use-instagram-chat-sessions: a 30s stale time so navigating away and
 * back doesn't immediately refetch, plus optimistic invalidation helpers
 * for create/update/delete actions.
 */
export function useChatbots(organizationId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery<ChatbotAutomation[], Error>(
    chatbotsQueryKey(organizationId),
    () => ChatbotAutomationService.getChatbots(organizationId as string),
    {
      enabled: Boolean(organizationId),
      staleTime: STALE_TIME_MS,
      cacheTime: CACHE_TIME_MS,
      keepPreviousData: true,
    },
  )

  const invalidate = () =>
    queryClient.invalidateQueries(chatbotsQueryKey(organizationId))

  return {
    chatbots: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  }
}
