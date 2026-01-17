import { Check, CheckCheck, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  className?: string
}

export function MessageStatus({ status = 'sent', className }: MessageStatusProps) {
  switch (status) {
    case 'sending':
      return <Clock className={cn("h-3.5 w-3.5 text-gray-400", className)} />
    case 'sent':
      return <Check className={cn("h-3.5 w-3.5 text-gray-400", className)} />
    case 'delivered':
      return <CheckCheck className={cn("h-3.5 w-3.5 text-gray-400", className)} />
    case 'read':
      return <CheckCheck className={cn("h-3.5 w-3.5 text-[#53bdeb]", className)} />
    case 'failed':
      return <XCircle className={cn("h-3.5 w-3.5 text-red-500", className)} />
    default:
      return <Check className={cn("h-3.5 w-3.5 text-gray-400", className)} />
  }
}
