"use client"

import { useQuery } from "react-query"

interface InstagramAppService {
  id: number
  instagram_business_account_id?: string
  instagram_page_id?: string
  instagram_page_name?: string
  instagram_access_token?: string
  name?: string
  channel?: string
}

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const fetchInstagramAppServices = async (organizationId: string): Promise<InstagramAppService[]> => {
  const response = await fetch(`/api/appservice/paginated/org/${organizationId}/instagram/appservices/`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch Instagram app services")
  }
  const data = await response.json()
  return normalizeList<InstagramAppService>(data)
}

export function useInstagramAppServices(organizationId?: string) {
  const query = useQuery(
    ["instagram-appservices", organizationId],
    () => fetchInstagramAppServices(organizationId as string),
    {
      enabled: Boolean(organizationId),
      staleTime: 5 * 60 * 1000,
    },
  )

  const appServices = query.data || []
  const primaryAccountId = appServices[0]?.instagram_business_account_id || ""
  const primaryPageId = appServices[0]?.instagram_page_id || ""

  return {
    appServices,
    primaryAccountId,
    primaryPageId,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
