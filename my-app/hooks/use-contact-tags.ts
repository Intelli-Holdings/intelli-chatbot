"use client"

import { useQuery } from "react-query"

export interface ContactTag {
  id: number
  name: string
  slug: string
}

const normalizeTags = (data: any): ContactTag[] => {
  if (Array.isArray(data)) return data
  return data?.results || []
}

const fetchContactTags = async (organizationId: string): Promise<ContactTag[]> => {
  const response = await fetch(`/api/contacts/tags?organization=${organizationId}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch tags")
  }
  const data = await response.json()
  return normalizeTags(data)
}

export function useContactTags(organizationId?: string) {
  const query = useQuery(
    ["contact-tags", organizationId],
    () => fetchContactTags(organizationId as string),
    {
      enabled: Boolean(organizationId),
      staleTime: 5 * 60 * 1000,
    }
  )

  return {
    tags: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
