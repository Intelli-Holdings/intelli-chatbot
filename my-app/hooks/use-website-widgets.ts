"use client"

import { useQuery } from "react-query"

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export interface WebsiteWidget {
  id: number
  widget_name: string
  widget_key: string
}

const normalizeWidgets = (data: any): WebsiteWidget[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const fetchWebsiteWidgets = async (organizationId: string, apiBaseUrl: string): Promise<WebsiteWidget[]> => {
  const response = await fetch(`${apiBaseUrl}/widgets/organization/${organizationId}/all/`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch widgets")
  }
  const data = await response.json()
  return normalizeWidgets(data)
}

export function useWebsiteWidgets(organizationId?: string, apiBaseUrl: string = DEFAULT_API_BASE_URL) {
  const query = useQuery(
    ["website-widgets", organizationId, apiBaseUrl],
    () => fetchWebsiteWidgets(organizationId as string, apiBaseUrl),
    {
      enabled: Boolean(organizationId),
      staleTime: 60 * 1000,
    },
  )

  return {
    widgets: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
