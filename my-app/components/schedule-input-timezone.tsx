"use client"

import { getTimezoneAbbr } from "@/lib/timezone-utils"

interface CampaignScheduleDisplayProps {
  scheduledAt?: string
}

export function CampaignScheduleDisplay({ scheduledAt }: CampaignScheduleDisplayProps) {
  if (!scheduledAt) {
    return <span className="text-muted-foreground text-sm">Immediate</span>
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">
        {new Date(scheduledAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="text-sm">
        {new Date(scheduledAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}{" "}
        <span className="text-xs text-muted-foreground">({getTimezoneAbbr()})</span>
      </div>
    </div>
  )
}
