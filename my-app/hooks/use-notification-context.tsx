"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { NotificationMessage } from "@/types/notification"
import useActiveOrganizationId from "./use-organization-id"
import { useUser } from "@clerk/nextjs"
import { NotificationContextType } from "@/types/notification"
import { Facebook, MessageSquare, Mail, Globe, Bell } from "lucide-react"

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: NotificationMessage[]
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  historicalNotifications: [],
  assignedNotifications: [],
  isConnected: false,
  unreadCount: 0,
  markAllAsRead: () => {},
  isLoading: false,
  error: null,
  fetchHistoricalNotifications: async () => {},
  fetchAssignedNotifications: async () => {}
})

export const useNotificationContext = () => useContext(NotificationContext)

const STORAGE_PREFIX = "org_notifications_"
const LAST_READ_PREFIX = "org_last_read_"

// Add type definitions for channel icons
type ChannelIcon = {
  icon: string | JSX.Element;
  bgColor: string;
  textColor: string;
}

type ChannelIcons = {
  [key in 'whatsapp' | 'facebook' | 'messenger' | 'instagram' | 'email' | 'website']: ChannelIcon;
}

// Add channel icon mapping with proper typing
const CHANNEL_ICONS: ChannelIcons = {
  whatsapp: {
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    bgColor: "bg-green-500",
    textColor: "text-white"
  },
  facebook: {
    icon: <Facebook className="h-full w-full" />,
    bgColor: "bg-blue-600",
    textColor: "text-white"
  },
  messenger: {
    icon: <MessageSquare className="h-full w-full" />,
    bgColor: "bg-blue-500",
    textColor: "text-white"
  },
  instagram: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    bgColor: "bg-pink-600",
    textColor: "text-white"
  },
  email: {
    icon: <Mail className="h-full w-full" />,
    bgColor: "bg-gray-600",
    textColor: "text-white"
  },
  website: {
    icon: <Globe className="h-full w-full" />,
    bgColor: "bg-blue-500",
    textColor: "text-white"
  }
}

// Helper function to get channel info with proper typing
const getChannelInfo = (channel?: string): ChannelIcon => {
  if (!channel) return {
    icon: <Bell className="h-5 w-5" />,
    bgColor: "bg-gray-500",
    textColor: "text-white"
  }
  
  const normalizedChannel = channel.toLowerCase() as keyof ChannelIcons
  return CHANNEL_ICONS[normalizedChannel] || {
    icon: <Bell className="h-5 w-5" />,
    bgColor: "bg-gray-500",
    textColor: "text-white"
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeOrganizationId = useActiveOrganizationId()
  const { user } = useUser()

  const storageKey = activeOrganizationId ? `${STORAGE_PREFIX}${activeOrganizationId}` : undefined
  const lastReadKey = activeOrganizationId ? `${LAST_READ_PREFIX}${activeOrganizationId}` : undefined

  const [notifications, setNotifications] = useState<NotificationMessage[]>([])
  const [historicalNotifications, setHistoricalNotifications] = useState<NotificationMessage[]>([])
  const [assignedNotifications, setAssignedNotifications] = useState<NotificationMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for WebSocket and reconnection
  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<number | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  // Fetch all historical notifications with pagination
  const fetchHistoricalNotifications = useCallback(async () => {
    if (!activeOrganizationId) return
    setIsLoading(true)
    setError(null)

    try {
      let nextUrl: string | null = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/org/${activeOrganizationId}/`
      const allResults: NotificationMessage[] = []

      while (nextUrl) {
        const response = await fetch(nextUrl)
        if (!response.ok) throw new Error('Failed to fetch historical notifications')
        const data: PaginatedResponse = await response.json()
        allResults.push(...data.results)
        nextUrl = data.next
      }

      setHistoricalNotifications(allResults)
      setNotifications(prev => {
        const existing = new Set(prev.map(n => n.id))
        const newItems = allResults.filter(n => !existing.has(n.id))
        const combined = [...newItems, ...prev]
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(combined))
        return combined
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      console.error('Error fetching historical notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activeOrganizationId, storageKey])

  // Fetch notifications assigned to current user
  const fetchAssignedNotifications = useCallback(async () => {
    const email = user?.primaryEmailAddress?.emailAddress
    if (!email) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/assigned/to/${email}/`
      )
      if (!response.ok) throw new Error('Failed to fetch assigned notifications')
      const data: PaginatedResponse = await response.json()
      setAssignedNotifications(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assigned notifications')
      console.error('Error fetching assigned notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load stored notifications and compute unread count
  useEffect(() => {
    if (!storageKey || !lastReadKey) return
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed: NotificationMessage[] = JSON.parse(stored)
        setNotifications(parsed)
        const lastRead = Number(localStorage.getItem(lastReadKey) || '0')
        const unread = parsed.filter(n => new Date(n.created_at).getTime() > lastRead).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error('Error reading notifications from localStorage:', err)
    }
  }, [storageKey, lastReadKey])

  // WebSocket connect logic
  const connect = useCallback(() => {
    if (!activeOrganizationId) return
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/events/${activeOrganizationId}/`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      // Ping every 30s
      pingIntervalRef.current = window.setInterval(() => ws.send(JSON.stringify({ type: 'ping' })), 30000)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("WebSocket message received:", data)

        const payload = data.message || data // Extract actual notification

        if (payload.type === "connection_established") {
          console.log("Connection established with notification service")
        } else if (payload.type === "notification") {
          // Add new notification to state
          setNotifications(prev => {
            const updated = [payload, ...prev]
            setNotifications(updated)
            return updated
          })

          // Increment unread count
          setUnreadCount(prev => prev + 1)

          // Get channel info using the helper function
          const channelInfo = getChannelInfo(payload.channel)

          // Show toast notification
          toast(
            <div className="flex items-start gap-3">
              <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full ${channelInfo.bgColor} flex items-center justify-center ${channelInfo.textColor}`}>
                {typeof channelInfo.icon === "string" ? (
                  <img src={channelInfo.icon} alt={payload.channel} className="h-5 w-5" />
                ) : (
                  channelInfo.icon
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-medium flex items-center gap-2">
                  {payload.chatsession?.customer_name || "New notification"}
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{payload.channel || "System"}</span>
                </div>
                <div className="text-sm text-gray-500 line-clamp-2">{payload.message}</div>
              </div>
            </div>,
            {
              duration: 5000,
              action: {
                label: "View",
                onClick: () => {
                  // Determine the correct URL based on channel
                  let path = "/dashboard/notifications"
                  const channel = payload.channel?.toLowerCase() || ""
                  
                  if (channel === "whatsapp") {
                    path = "/dashboard/conversations/whatsapp"
                  } else if (channel === "website") {
                    path = "/dashboard/conversations/website"
                  } else if (channel === "facebook" || channel === "messenger") {
                    path = "/dashboard/conversations/facebook"
                  } else if (channel === "instagram") {
                    path = "/dashboard/conversations/instagram"
                  } else if (channel === "email") {
                    path = "/dashboard/conversations/email"
                  }
                  
                  window.location.href = path
                },
              },
            },
          )
        } else if (payload.type === "pong") {
          console.log("Received pong from server")
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      // Attempt reconnect after 5s
      reconnectTimeoutRef.current = window.setTimeout(connect, 5000)
    }

    ws.onerror = err => {
      console.error('WebSocket error', err)
      ws.close()
    }
  }, [activeOrganizationId])

  // Initialize and cleanup WebSocket
  useEffect(() => {
    connect()
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [connect])

  // Reconnect on network changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network restored, reconnecting WS...")
      connect()
    }
    const handleOffline = () => {
      console.log("Network lost, WS will reconnect when online.")
      setIsConnected(false)
    }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [connect])

  // Initial fetch of historical & assigned
  useEffect(() => {
    if (activeOrganizationId) fetchHistoricalNotifications()
    if (user?.primaryEmailAddress) fetchAssignedNotifications()
  }, [activeOrganizationId, user, fetchHistoricalNotifications, fetchAssignedNotifications])

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (!lastReadKey) return
    const now = Date.now().toString()
    localStorage.setItem(lastReadKey, now)
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        historicalNotifications,
        assignedNotifications,
        isConnected,
        unreadCount,
        markAllAsRead,
        isLoading,
        error,
        fetchHistoricalNotifications,
        fetchAssignedNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
