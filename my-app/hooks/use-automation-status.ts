"use client"

import { useState, useEffect, useCallback } from "react"

export interface AutomationStatus {
  automation_mode: string
  assistant: { id: number; name: string } | null
  chatbot_flow: { id: string; name: string } | null
  auto_fallback: boolean
  automation_paused: boolean
}

export interface UseAutomationStatusReturn {
  status: AutomationStatus | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  togglePause: () => Promise<void>
  toggling: boolean
}

export function useAutomationStatus(appServiceId: number | undefined): UseAutomationStatusReturn {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (!appServiceId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appservice/${appServiceId}/automation`)

      if (!response.ok) {
        throw new Error("Failed to fetch automation status")
      }

      const data: AutomationStatus = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Error fetching automation status:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch automation status")
    } finally {
      setLoading(false)
    }
  }, [appServiceId])

  const togglePause = useCallback(async () => {
    if (!appServiceId) return

    setToggling(true)
    try {
      const response = await fetch(`/api/appservice/${appServiceId}/automation/toggle-pause`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle automation pause")
      }

      const data = await response.json()
      setStatus(prev => prev ? { ...prev, automation_paused: data.automation_paused } : null)
    } catch (err) {
      console.error("Error toggling automation pause:", err)
      throw err
    } finally {
      setToggling(false)
    }
  }, [appServiceId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    togglePause,
    toggling,
  }
}
