"use client"
import { Bell } from "lucide-react"
import { useNotificationContext } from "@/hooks/use-notification-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NotificationIndicator() {
  const { unreadCount, isConnected } = useNotificationContext()

  return (
    <Link href="/dashboard/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
        <div
          className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          title={isConnected ? "Connected to notification service" : "Disconnected from notification service"}
        />
      </Button>
    </Link>
  )
}
