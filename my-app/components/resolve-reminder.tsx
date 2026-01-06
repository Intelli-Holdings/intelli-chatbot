"use client"
import React, { useState, useEffect } from "react"
import { Clock, Info, AlertTriangle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ResolveReminderProps {
  className?: string;
  lastCustomerMessageTime?: string;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
}

const calculateTimeRemaining = (lastMessageTime: string | undefined): TimeRemaining => {
  if (!lastMessageTime) {
    return { hours: 24, minutes: 0, seconds: 0, isExpired: false, isWarning: false };
  }

  const lastMessage = new Date(lastMessageTime);
  const expiryTime = new Date(lastMessage.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
  const now = new Date();
  const diffMs = expiryTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, isWarning: false };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const isWarning = hours < 2; // Warning when less than 2 hours remaining

  return { hours, minutes, seconds, isExpired: false, isWarning };
};

const ResolveReminder: React.FC<ResolveReminderProps> = React.memo(({ className, lastCustomerMessageTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(lastCustomerMessageTime)
  );

  useEffect(() => {
    // Update immediately when lastCustomerMessageTime changes
    setTimeRemaining(calculateTimeRemaining(lastCustomerMessageTime));

    // Only set up interval if we have a timestamp
    if (!lastCustomerMessageTime) {
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(lastCustomerMessageTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCustomerMessageTime]);

  const { hours, minutes, seconds, isExpired, isWarning } = timeRemaining;

  // Determine colors based on state
  const bgColor = isExpired
    ? 'bg-red-50'
    : isWarning
    ? 'bg-orange-50'
    : 'bg-[#fff4e6]';

  const borderColor = isExpired
    ? 'border-red-200'
    : isWarning
    ? 'border-orange-200'
    : 'border-[#ffe0b2]';

  const hoverColor = isExpired
    ? 'hover:bg-red-100'
    : isWarning
    ? 'hover:bg-orange-100'
    : 'hover:bg-[#ffeccc]';

  const iconColor = isExpired
    ? 'text-red-600'
    : isWarning
    ? 'text-orange-600'
    : 'text-[#f57c00]';

  const textColor = isExpired
    ? 'text-red-700'
    : isWarning
    ? 'text-orange-700'
    : 'text-[#e65100]';

  const formatTime = () => {
    if (isExpired) return 'Expired';
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 px-2 py-1 ${bgColor} border ${borderColor} rounded-md cursor-pointer ${hoverColor} transition-colors shrink-0`}
        >
          {isExpired ? (
            <AlertTriangle className={`h-3 w-3 ${iconColor} shrink-0`} />
          ) : (
            <Clock className={`h-3 w-3 ${iconColor} shrink-0 ${isWarning ? 'animate-pulse' : ''}`} />
          )}
          <span className={`text-[10px] font-semibold ${textColor} whitespace-nowrap tabular-nums`}>
            {formatTime()}
          </span>
          <Info className={`h-3 w-3 ${iconColor} shrink-0`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            {isExpired ? (
              <AlertTriangle className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
            ) : (
              <Clock className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
            )}
            <div>
              <h4 className="font-semibold text-sm text-[#111b21] mb-1">
                24-Hour Response Window
              </h4>
              {lastCustomerMessageTime ? (
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                    {isExpired ? '⏰ Window Expired' : `⏱️ ${hours}h ${minutes}m ${seconds}s remaining`}
                  </p>
                  {isExpired ? (
                    <p className="text-xs text-red-600 leading-relaxed">
                      The 24-hour window has expired. You'll need to use a template message at extra cost to restart the conversation.
                    </p>
                  ) : (
                    <p className="text-xs text-[#667781] leading-relaxed">
                      Respond before the window expires to maintain free messaging.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#667781] leading-relaxed">
                  Respond to escalations within 24 hours to maintain WhatsApp messaging privileges.
                </p>
              )}
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
});

ResolveReminder.displayName = 'ResolveReminder';

export default ResolveReminder;
