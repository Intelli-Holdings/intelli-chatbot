"use client"

import { useState, useCallback } from "react"
import { CannedResponse, CannedResponseCreateInput, CannedResponseUpdateInput } from "@/types/canned-responses"
import { logger } from "@/lib/logger"

export function useCannedResponses(organizationId: string | undefined) {
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCannedResponses = useCallback(async (category?: string, search?: string) => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category) params.append("category", category)
      if (search) params.append("search", search)

      const url = `/api/canned-responses/${organizationId}${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch canned responses")
      }

      setCannedResponses(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch canned responses"
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const createCannedResponse = useCallback(async (input: CannedResponseCreateInput) => {
    if (!organizationId) return null

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/canned-responses/${organizationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create canned response")
      }

      setCannedResponses((prev) => [data, ...prev])
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create canned response"
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const updateCannedResponse = useCallback(async (responseId: number, input: CannedResponseUpdateInput) => {
    if (!organizationId) return null

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/canned-responses/${organizationId}/${responseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update canned response")
      }

      setCannedResponses((prev) =>
        prev.map((item) => (item.id === responseId ? data : item))
      )
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update canned response"
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const deleteCannedResponse = useCallback(async (responseId: number) => {
    if (!organizationId) return false

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/canned-responses/${organizationId}/${responseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete canned response")
      }

      setCannedResponses((prev) => prev.filter((item) => item.id !== responseId))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete canned response"
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  const recordUsage = useCallback(async (responseId: number) => {
    if (!organizationId) return

    try {
      await fetch(`/api/canned-responses/${organizationId}/${responseId}/use`, {
        method: "POST",
      })
      // Update local state to reflect usage increase
      setCannedResponses((prev) =>
        prev.map((item) =>
          item.id === responseId ? { ...item, usage_count: item.usage_count + 1 } : item
        )
      )
    } catch (err) {
      logger.error("Failed to record usage", { error: err instanceof Error ? err.message : String(err) })
    }
  }, [organizationId])

  const getByShortcut = useCallback(async (shortcut: string): Promise<CannedResponse | null> => {
    if (!organizationId) return null

    try {
      const response = await fetch(
        `/api/canned-responses/${organizationId}/by-shortcut?shortcut=${encodeURIComponent(shortcut)}`
      )

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }, [organizationId])

  return {
    cannedResponses,
    loading,
    error,
    fetchCannedResponses,
    createCannedResponse,
    updateCannedResponse,
    deleteCannedResponse,
    recordUsage,
    getByShortcut,
  }
}
