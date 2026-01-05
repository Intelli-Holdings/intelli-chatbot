"use client"

import { useQuery } from "react-query"

interface WhatsAppAppService {
  id: number
  phone_number?: string
  phone_number_id?: string
  whatsapp_business_account_id?: string
  access_token?: string
  name?: string
}

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const fetchWhatsAppAppServices = async (organizationId: string): Promise<WhatsAppAppService[]> => {
  const response = await fetch(`/api/appservice/paginated/org/${organizationId}/appservices/`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch WhatsApp app services")
  }
  const data = await response.json()
  return normalizeList<WhatsAppAppService>(data)
}

export function useWhatsAppAppServices(organizationId?: string) {
  const query = useQuery(
    ["whatsapp-appservices", organizationId],
    () => fetchWhatsAppAppServices(organizationId as string),
    {
      enabled: Boolean(organizationId),
      staleTime: 5 * 60 * 1000,
    },
  )

  const appServices = query.data || []
  const primaryPhoneNumber = appServices[0]?.phone_number || ""

  return {
    appServices,
    primaryPhoneNumber,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
