"use client"

import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Clock,
  Rocket,
  CheckCircle2,
  Pause,
  XCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "ready"
  | "sending"
  | "sent"
  | "completed"
  | "paused"
  | "failed"

interface CampaignStatusBadgeProps {
  status: CampaignStatus
  className?: string
  showIcon?: boolean
  variant?: "default" | "outline"
}

const statusConfig: Record<CampaignStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
  animated?: boolean
}> = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ready: {
    label: "Ready",
    icon: Rocket,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  sending: {
    label: "Sending",
    icon: Loader2,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    animated: true,
  },
  sent: {
    label: "Sent",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  paused: {
    label: "Paused",
    icon: Pause,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

export function CampaignStatusBadge({
  status,
  className,
  showIcon = true,
  variant = "default"
}: CampaignStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant={variant}
      className={cn(
        "flex items-center gap-1.5 font-medium",
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            config.animated && "animate-spin"
          )}
        />
      )}
      <span>{config.label}</span>
    </Badge>
  )
}

// Helper function to determine status from campaign data
export function getCampaignStatus(campaign: {
  scheduled_at?: string | null
  run_at?: string | null
  status?: string
}): CampaignStatus {
  // If explicit status is provided, use it
  if (campaign.status && statusConfig[campaign.status as CampaignStatus]) {
    return campaign.status as CampaignStatus
  }

  // Otherwise, calculate from timestamps (legacy behavior)
  const now = new Date()
  const scheduledAt = campaign.scheduled_at ? new Date(campaign.scheduled_at) : null
  const runAt = campaign.run_at ? new Date(campaign.run_at) : null

  // Campaign has been executed
  if (runAt) {
    return "completed"
  }

  // Campaign is scheduled
  if (scheduledAt) {
    if (scheduledAt > now) {
      return "scheduled"
    } else {
      return "ready"
    }
  }

  // Default to draft
  return "draft"
}

// Status helper functions
export const statusHelpers = {
  canEdit: (status: CampaignStatus) => {
    return status === "draft" || status === "scheduled"
  },

  canPause: (status: CampaignStatus) => {
    return status === "ready" || status === "sending"
  },

  canResume: (status: CampaignStatus) => {
    return status === "paused"
  },

  canDelete: (status: CampaignStatus) => {
    return status === "draft" || status === "paused" || status === "failed"
  },

  isActive: (status: CampaignStatus) => {
    return status === "sending" || status === "ready"
  },

  isCompleted: (status: CampaignStatus) => {
    return status === "sent" || status === "completed" || status === "failed"
  }
}
