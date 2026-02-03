"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Bot, Cpu, Loader2, MessageSquare, Pause, Play, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { AutomationStatus } from "@/hooks/use-automation-status"

interface AutomationStatusIndicatorProps {
  status: AutomationStatus | null
  loading: boolean
  onTogglePause: () => Promise<void>
  toggling: boolean
  compact?: boolean
}

export function AutomationStatusIndicator({
  status,
  loading,
  onTogglePause,
  toggling,
  compact = false,
}: AutomationStatusIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-2">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        {!compact && <span className="text-xs text-muted-foreground">Loading...</span>}
      </div>
    )
  }

  if (!status) {
    return null
  }

  const getModeInfo = () => {
    if (status.automation_paused) {
      return {
        label: "Paused",
        icon: Pause,
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        description: "Automation is paused",
      }
    }

    switch (status.automation_mode) {
      case "ai_only":
        return {
          label: "AI Only",
          icon: Cpu,
          color: "bg-blue-500",
          textColor: "text-blue-600",
          description: status.assistant ? `Using ${status.assistant.name}` : "AI assistant active",
        }
      case "chatbot_only":
        return {
          label: "Chatbot",
          icon: Bot,
          color: "bg-green-500",
          textColor: "text-green-600",
          description: status.chatbot_flow ? `Using ${status.chatbot_flow.name}` : "Chatbot flow active",
        }
      case "chatbot_with_fallback":
        return {
          label: "Chatbot + AI",
          icon: Bot,
          color: "bg-purple-500",
          textColor: "text-purple-600",
          description: "Chatbot with AI fallback",
        }
      case "manual":
      default:
        return {
          label: "Manual",
          icon: MessageSquare,
          color: "bg-gray-400",
          textColor: "text-gray-500",
          description: "Manual handling only",
        }
    }
  }

  const modeInfo = getModeInfo()
  const ModeIcon = modeInfo.icon

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <div className={cn("size-2 rounded-full", modeInfo.color)} />
              <ModeIcon className={cn("size-3", modeInfo.textColor)} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="font-medium">{modeInfo.label}</p>
            <p className="text-xs text-muted-foreground">{modeInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-2 px-3 hover:bg-accent",
            status.automation_paused && "text-yellow-600"
          )}
        >
          <div className={cn("size-2 rounded-full", modeInfo.color)} />
          <ModeIcon className="size-4" />
          <span className="text-xs font-medium">{modeInfo.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ModeIcon className={cn("size-4", modeInfo.textColor)} />
              <span className="font-medium">{modeInfo.label}</span>
            </div>
            <Badge variant="secondary" className={cn("text-xs", modeInfo.color, "text-white")}>
              Active
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">{modeInfo.description}</p>

          {status.automation_mode !== "manual" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={status.automation_paused ? "default" : "outline"}
                className="flex-1 h-8"
                onClick={onTogglePause}
                disabled={toggling}
              >
                {toggling ? (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                ) : status.automation_paused ? (
                  <Play className="mr-1 size-3" />
                ) : (
                  <Pause className="mr-1 size-3" />
                )}
                {status.automation_paused ? "Resume" : "Pause"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8" asChild>
                <Link href="/dashboard/settings/automation">
                  <Settings className="size-3" />
                </Link>
              </Button>
            </div>
          )}

          {status.automation_mode === "manual" && (
            <Button size="sm" variant="outline" className="w-full h-8" asChild>
              <Link href="/dashboard/settings/automation">
                <Settings className="mr-1 size-3" />
                Configure
              </Link>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
