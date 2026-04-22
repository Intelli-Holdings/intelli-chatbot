"use client"

import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "completed"
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
  sending: {
    label: "Sending",
    icon: Loader2,
    className: "bg-orange-100 text-orange-800 border-orange-200",
    animated: true,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
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

// The backend is the single source of truth for status. This helper preserves
// the existing call sites and falls back to 'draft' for any unknown legacy
// values (e.g. cached responses still serving 'ready' or 'paused').
export function getCampaignStatus(campaign: { status?: string }): CampaignStatus {
  if (campaign.status && campaign.status in statusConfig) {
    return campaign.status as CampaignStatus
  }
  return "draft"
}

export const statusHelpers = {
  canEdit: (status: CampaignStatus) => {
    return status === "draft" || status === "scheduled"
  },

  canCancel: (status: CampaignStatus) => {
    return status === "sending"
  },

  canDelete: (status: CampaignStatus) => {
    return status === "draft" || status === "scheduled" || status === "failed"
  },

  isActive: (status: CampaignStatus) => {
    return status === "sending"
  },

  isCompleted: (status: CampaignStatus) => {
    return status === "completed" || status === "failed"
  }
}
