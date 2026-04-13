"use client"

import { useCallback, useRef, useState } from "react"
import { logger } from "@/lib/logger"

interface CustomerProfile {
  name: string
  username?: string
  profile_pic?: string
}

/**
 * Hook to resolve and cache Instagram customer profiles (name/username)
 * from IGSIDs. Calls the /api/instagram/customer-profiles endpoint
 * and caches results so each IGSID is only fetched once per session.
 */
export function useInstagramCustomerProfiles(
  organizationId?: string,
  instagramBusinessAccountId?: string,
) {
  const cacheRef = useRef<Map<string, CustomerProfile>>(new Map())
  const pendingRef = useRef<Set<string>>(new Set())
  const [version, setVersion] = useState(0)

  const resolveProfiles = useCallback(
    async (customerIds: string[]) => {
      if (!organizationId || !instagramBusinessAccountId) return

      // Filter to only unresolved, non-pending IDs
      const unresolvedIds = customerIds.filter(
        (id) => id && !cacheRef.current.has(id) && !pendingRef.current.has(id),
      )

      if (unresolvedIds.length === 0) return

      // Mark as pending
      for (const id of unresolvedIds) {
        pendingRef.current.add(id)
      }

      try {
        const response = await fetch("/api/instagram/customer-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: organizationId,
            instagram_business_account_id: instagramBusinessAccountId,
            customer_ids: unresolvedIds,
          }),
        })

        if (!response.ok) return

        const data = await response.json()
        const profiles: Record<string, CustomerProfile> = data.profiles || {}

        let didUpdate = false
        for (const [id, profile] of Object.entries(profiles)) {
          cacheRef.current.set(id, profile as CustomerProfile)
          didUpdate = true
        }

        // Trigger a re-render so consumers see updated names
        if (didUpdate) {
          setVersion((v) => v + 1)
        }
      } catch (error) {
        logger.error("Failed to resolve customer profiles", {
          error: error instanceof Error ? error.message : String(error),
        })
      } finally {
        for (const id of unresolvedIds) {
          pendingRef.current.delete(id)
        }
      }
    },
    [organizationId, instagramBusinessAccountId],
  )

  const getDisplayName = useCallback(
    (customerId: string, fallback?: string): string => {
      const cached = cacheRef.current.get(customerId)
      if (cached) return cached.username || cached.name
      return fallback || customerId
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  )

  const getProfile = useCallback(
    (customerId: string): CustomerProfile | undefined => {
      return cacheRef.current.get(customerId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  )

  return { resolveProfiles, getDisplayName, getProfile }
}
