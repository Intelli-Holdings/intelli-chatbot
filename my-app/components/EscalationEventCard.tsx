import type { ReactNode } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, RefreshCw } from "lucide-react";
import { Event } from "@/types/events";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (id: number) => void;
  actions?: ReactNode;
  readOnly?: boolean;
  variant?: "full" | "compact";
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  actions,
  readOnly = false,
  variant = "full",
}: EventCardProps) {
  const isCompact = variant === "compact";
  const showDefaultActions = Boolean(onEdit && onDelete && !actions && !readOnly);
  return (
    <Card
      className={cn(
        "border-[#e9edef] bg-white transition-colors",
        isCompact ? "shadow-none" : "hover:shadow-md"
      )}
    >
      <CardContent className={cn(isCompact ? "p-3" : "p-6")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-semibold text-[#111b21]",
                  isCompact ? "text-[14px]" : "text-lg"
                )}
              >
                {event.name}
              </h3>
              <Badge
                className={cn(
                  "border-[#cfe1ff] bg-[#e6f2ff] text-[#005cb8]",
                  isCompact ? "text-[10px]" : "text-[11px]"
                )}
              >
                {event.system_name}
              </Badge>
            </div>
            <p
              className={cn(
                "mt-1 text-[#667781]",
                isCompact ? "text-[12px] line-clamp-2" : "text-sm"
              )}
            >
              {event.description}
            </p>
            <div
              className={cn(
                "mt-3 flex items-center gap-3 text-[#667781]",
                isCompact ? "text-[10px]" : "text-xs"
              )}
            >
              <span className="flex items-center gap-1">
                <Clock className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>Created {format(new Date(event.created_at), "PP")}</span>
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className={cn(isCompact ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>Updated {format(new Date(event.updated_at), "PP")}</span>
              </span>
            </div>
          </div>
          {(actions || showDefaultActions) && (
            <div className="flex items-center gap-1.5">
              {actions}
              {showDefaultActions && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "text-[#667781] hover:text-[#111b21]",
                          isCompact ? "h-7 w-7" : "h-8 w-8"
                        )}
                        onClick={() => onEdit?.(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit event</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "text-red-500 hover:text-red-600",
                          isCompact ? "h-7 w-7" : "h-8 w-8"
                        )}
                        onClick={() => onDelete?.(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete event</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
