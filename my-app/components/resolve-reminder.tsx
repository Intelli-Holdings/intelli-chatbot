"use client"
import React from "react"
import { Clock, Info } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ResolveReminderProps {
  className?: string;
}

const ResolveReminder: React.FC<ResolveReminderProps> = ({ className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#fff4e6] border border-[#ffe0b2] rounded-md cursor-pointer hover:bg-[#ffeccc] transition-colors ${className}`}>
          <Clock className="h-3.5 w-3.5 text-[#f57c00] shrink-0" />
          <span className="text-[11px] font-medium text-[#e65100] flex-1">
            24h Response Window
          </span>
          <Info className="h-3.5 w-3.5 text-[#f57c00] shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-[#f57c00] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-[#111b21] mb-1">
                24-Hour Response Window
              </h4>
              <p className="text-xs text-[#667781] leading-relaxed">
                Respond to escalations within 24 hours to maintain WhatsApp messaging privileges.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#667781]">
            <div className="bg-[#f0f2f5] p-2 rounded-md">
              <p className="font-medium text-[#111b21] mb-1">WhatsApp Policy</p>
              <p className="leading-relaxed">
                You can only reply within 24 hours of the customer&apos;s last message. After this window, you&apos;ll need to restart the conversation at extra cost.
              </p>
            </div>

            <div className="bg-[#f0f2f5] p-2 rounded-md">
              <p className="font-medium text-[#111b21] mb-1">Best Practice</p>
              <p className="leading-relaxed">
                Resolve inquiries quickly to reduce costs, maintain continuous communication, and provide better service.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
};

export default ResolveReminder;
