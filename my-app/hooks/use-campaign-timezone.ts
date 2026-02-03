"use client"

/**
 * Hook for managing campaign scheduling with proper timezone handling
 */

import { useState, useCallback } from "react"
import { convertLocalToUTC, formatUTCForDisplay } from "@/lib/timezone-utils"

export function useCampaignTimezone() {
  const [scheduledAtUTC, setScheduledAtUTC] = useState<string>("")
  const [scheduleNow, setScheduleNow] = useState(true)

  const handleScheduleChange = useCallback((localDateTimeString: string) => {
    if (!localDateTimeString) {
      setScheduledAtUTC("")
      return
    }
    const utcIsoString = convertLocalToUTC(localDateTimeString)
    setScheduledAtUTC(utcIsoString)
  }, [])

  const getScheduleForAPI = useCallback(() => {
    return scheduleNow ? undefined : scheduledAtUTC
  }, [scheduleNow, scheduledAtUTC])

  const getDisplaySchedule = useCallback(() => {
    if (scheduleNow) return "Send immediately"
    return formatUTCForDisplay(scheduledAtUTC)
  }, [scheduleNow, scheduledAtUTC])

  return {
    scheduledAtUTC,
    scheduleNow,
    setScheduleNow,
    handleScheduleChange,
    getScheduleForAPI,
    getDisplaySchedule,
  }
}
