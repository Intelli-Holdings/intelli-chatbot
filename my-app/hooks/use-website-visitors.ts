"use client"

import { useQuery } from "react-query"

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

const fetchWebsiteVisitors = async (widgetKey: string): Promise<WebsiteVisitor[]> => {
  const response = await fetch(`/api/widgets/widget/${encodeURIComponent(widgetKey)}/visitors`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch visitors")
  }
  const data = await response.json()
  return normalizeVisitors(data)
}

export function useWebsiteVisitors(widgetKey?: string) {
  const query = useQuery(
    ["website-visitors", widgetKey],
    () => fetchWebsiteVisitors(widgetKey as string),
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
