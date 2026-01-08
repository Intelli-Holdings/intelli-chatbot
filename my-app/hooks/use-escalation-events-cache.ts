"use client"

import { useQuery } from "react-query"
import type { Event } from "@/types/events"

export const ESCALATION_EVENTS_STALE_TIME_MS = 60 * 1000
export const ESCALATION_EVENTS_CACHE_TIME_MS = 5 * 60 * 1000

export const escalationEventsQueryKey = (organizationId?: string) =>
  ["escalation-events", organizationId ?? ""] as const

const normalizeEvents = (data: unknown): Event[] => {
  if (!Array.isArray(data)) return []
  return data.filter(Boolean) as Event[]
}

export async function fetchEscalationEventsForOrg(
  organizationId: string,
): Promise<Event[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/events/${organizationId}/`,
  )

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch escalation events")
  }

  const data = await response.json()
  return normalizeEvents(data)
}

export function useEscalationEventsCache(organizationId?: string) {
  const query = useQuery(
    escalationEventsQueryKey(organizationId),
    () => fetchEscalationEventsForOrg(organizationId as string),
    {
      enabled: Boolean(organizationId),
      keepPreviousData: true,
      staleTime: ESCALATION_EVENTS_STALE_TIME_MS,
      cacheTime: ESCALATION_EVENTS_CACHE_TIME_MS,
    },
  )

  return {
    events: (query.data ?? []) as Event[],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
