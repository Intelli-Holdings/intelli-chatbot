"use client"

import { useQuery } from "react-query"

export interface AssistantBase {
  id: number
  name: string
  assistant_id: string
  organization: string
  prompt?: string
  [key: string]: unknown
}

export const ASSISTANTS_STALE_TIME_MS = 60 * 1000
export const ASSISTANTS_CACHE_TIME_MS = 5 * 60 * 1000

export const assistantsQueryKey = (organizationId?: string) =>
  ["assistants", organizationId ?? ""] as const

const normalizeAssistants = <T extends AssistantBase>(data: unknown): T[] => {
  if (!Array.isArray(data)) return []
  return data.filter(Boolean) as T[]
}

export async function fetchAssistantsForOrg<T extends AssistantBase = AssistantBase>(
  organizationId: string,
): Promise<T[]> {
  const response = await fetch(`/api/assistants/${organizationId}`)

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch assistants")
  }

  const data = await response.json()
  return normalizeAssistants<T>(data)
}

export function useAssistantsCache<T extends AssistantBase = AssistantBase>(
  organizationId?: string,
  options?: {
    enabled?: boolean
    staleTimeMs?: number
    cacheTimeMs?: number
  },
) {
  const query = useQuery(
    assistantsQueryKey(organizationId),
    () => fetchAssistantsForOrg<T>(organizationId as string),
    {
      enabled: Boolean(organizationId) && (options?.enabled ?? true),
      keepPreviousData: true,
      staleTime: options?.staleTimeMs ?? ASSISTANTS_STALE_TIME_MS,
      cacheTime: options?.cacheTimeMs ?? ASSISTANTS_CACHE_TIME_MS,
    },
  )

  return {
    assistants: (query.data ?? []) as T[],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
