"use client"
import { Bell, CheckCircle, Eye, Globe, Mail, Facebook, MessageSquare, ExternalLink } from "lucide-react"
import { useNotificationContext } from "@/hooks/use-notification-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function NotificationIndicator() {
  const {
    notifications,
    historicalNotifications,
    unreadCount,
    isConnected,
    markAllAsRead,
    fetchHistoricalNotifications,
    fetchAssignedNotifications,
  } = useNotificationContext()
  const router = useRouter()

  // Fetch notifications when dropdown opens (respects cache TTL)
  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchHistoricalNotifications()
      fetchAssignedNotifications()
    }
  }

  // Combine live and historical notifications, remove duplicates
  const allNotifications = [...notifications]
  const notificationIds = new Set(notifications.map(n => n.id))
  historicalNotifications.forEach(n => {
    if (!notificationIds.has(n.id)) {
      allNotifications.push(n)
    }
  })

  // Sort by date, most recent first
  const sortedNotifications = allNotifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10) // Show only latest 10 in dropdown

  const getChannelIcon = (channel?: string) => {
    switch (channel?.toLowerCase() || "") {
      case "whatsapp":
        return "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "messenger":
        return <MessageSquare className="h-4 w-4" />
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      case "email":
        return <Mail className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleNavigateToConversation = (channel: string = '') => {
    let path = '/dashboard/conversations'

    const normalizedChannel = channel.toLowerCase()

    switch (normalizedChannel) {
      case 'whatsapp':
        path = '/dashboard/conversations/whatsapp'
        break
      case 'website':
        path = '/dashboard/conversations/website'
        break
      case 'facebook':
      case 'messenger':
        path = '/dashboard/conversations/facebook'
        break
      case 'instagram':
        path = '/dashboard/conversations/instagram'
        break
      case 'email':
        path = '/dashboard/conversations/email'
        break
    }

    router.push(path)
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
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
            className={`absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-background ${isConnected ? "bg-[#007fff]" : "bg-red-500"}`}
            title={isConnected ? "Connected to notification service" : "Disconnected from notification service"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-base font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedNotifications.map((notification) => {
                const channelIcon = getChannelIcon(notification.channel)
                const isUnread = new Date(notification.created_at).getTime() >
                  (typeof window !== 'undefined'
                    ? Number(localStorage.getItem(`org_last_read_${notification.organization_id}`) || '0')
                    : 0)

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 cursor-pointer ${
                      isUnread ? 'bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                    onClick={() => handleNavigateToConversation(notification.channel)}
                  >
                    <Avatar className="h-10 w-10 mt-1 flex-shrink-0">
                      {typeof channelIcon === "string" ? (
                        <AvatarImage src={channelIcon} alt={notification.channel} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                          {channelIcon}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.chatsession?.customer_name || notification.widget_visitor?.visitor_name || "Unknown Customer"}
                          </p>
                          {/* Display phone number if available */}
                          {(notification.chatsession?.customer_number || notification.widget_visitor?.visitor_phone) && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {notification.chatsession?.customer_number || notification.widget_visitor?.visitor_phone}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {notification.channel}
                        </Badge>
                        {/* Display business phone number (AppService) if available */}
                        {notification.chatsession?.business_phone_number && (
                          <Badge variant="secondary" className="text-xs">
                            {notification.chatsession.business_phone_number}
                          </Badge>
                        )}
                        {notification.status && (
                          <Badge
                            variant={notification.status === 'resolved' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {notification.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/notifications"
            className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            View all notifications
            <ExternalLink className="h-3 w-3" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
