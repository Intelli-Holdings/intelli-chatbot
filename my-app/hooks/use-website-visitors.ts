"use client"

import { useQuery } from "react-query"

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export interface WebsiteVisitor {
  id: number
  visitor_id: string
  visitor_email?: string | null
  visitor_name?: string | null
  visitor_phone?: string | null
  ip_address?: string
  created_at?: string
  last_seen?: string
  is_handle_by_human?: boolean
  messages?: Array<{
    id: number
    content: string
    answer?: string
    timestamp?: string
    sender_type?: string
  }>
  unread_count?: number
}

const normalizeVisitors = (data: any): WebsiteVisitor[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const fetchWebsiteVisitors = async (widgetKey: string, apiBaseUrl: string): Promise<WebsiteVisitor[]> => {
  const response = await fetch(`${apiBaseUrl}/widgets/widget/${widgetKey}/visitors/`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch visitors")
  }
  const data = await response.json()
  return normalizeVisitors(data)
}

export function useWebsiteVisitors(widgetKey?: string, apiBaseUrl: string = DEFAULT_API_BASE_URL) {
  const query = useQuery(
    ["website-visitors", widgetKey, apiBaseUrl],
    () => fetchWebsiteVisitors(widgetKey as string, apiBaseUrl),
    {
      enabled: Boolean(widgetKey),
      staleTime: 30 * 1000,
    },
  )

  return {
    visitors: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
