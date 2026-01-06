"use client"

import { useMemo } from "react"
import { useInfiniteQuery } from "react-query"

interface ChatSessionsResponse<T> {
  results: T[]
  next: string | null
  previous?: string | null
  count?: number
}

const normalizeResponse = <T,>(data: any): ChatSessionsResponse<T> => ({
  results: Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [],
  next: data?.next ?? null,
  previous: data?.previous ?? null,
  count: typeof data?.count === "number" ? data.count : undefined,
})

const fetchChatSessions = async (
  organizationId: string,
  phoneNumber: string,
  page: number,
  pageSize: number,
): Promise<ChatSessionsResponse<any>> => {
  const response = await fetch(
    `/api/appservice/paginated/conversations/whatsapp/chat_sessions/org/${organizationId}/${phoneNumber}/?page=${page}&page_size=${pageSize}`,
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch chat sessions")
  }

  const data = await response.json()
  return normalizeResponse<any>(data)
}

const getNextPageNumber = (nextUrl: string | null, fallback: number) => {
  if (!nextUrl) return undefined
  try {
    const base = typeof window === "undefined" ? "http://localhost" : window.location.origin
    const parsed = new URL(nextUrl, base)
    const pageParam = parsed.searchParams.get("page")
    const nextPage = pageParam ? Number(pageParam) : fallback
    return Number.isFinite(nextPage) ? nextPage : fallback
  } catch {
    return fallback
  }
}

export function useWhatsAppChatSessions(
  organizationId?: string,
  phoneNumber?: string,
  pageSize: number = 12,
) {
  const query = useInfiniteQuery(
    ["whatsapp-chat-sessions", organizationId, phoneNumber, pageSize],
    ({ pageParam = 1 }) =>
      fetchChatSessions(organizationId as string, phoneNumber as string, pageParam, pageSize),
    {
      enabled: Boolean(organizationId && phoneNumber),
      getNextPageParam: (lastPage, allPages) =>
        getNextPageNumber(lastPage?.next ?? null, allPages.length + 1),
      staleTime: 30 * 1000,
    },
  )

  const sessions = useMemo(
    () => query.data?.pages.flatMap((page) => page.results || []) || [],
    [query.data?.pages],
  )
  const totalCount = useMemo(
    () => query.data?.pages?.[0]?.count ?? sessions.length,
    [query.data?.pages, sessions.length],
  )

  return {
    sessions,
    totalCount,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
