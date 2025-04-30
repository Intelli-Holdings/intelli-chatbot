"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { NotificationMessage } from "@/types/notification"
import useActiveOrganizationId from "./use-organization-id"
import { Bell, MessageCircle } from "lucide-react"
import { NotificationContextType } from "@/types/notification"



const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    isConnected: false,
    unreadCount: 0,
    markAllAsRead: () => { },
    isLoading: false,
    error: null
})

export const useNotificationContext = () => useContext(NotificationContext)

const STORAGE_PREFIX = "org_notifications_"
const LAST_READ_PREFIX = "org_last_read_"

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeOrganizationId = useActiveOrganizationId()
  const storageKey = activeOrganizationId ? `${STORAGE_PREFIX}${activeOrganizationId}` : null
  const lastReadKey = activeOrganizationId ? `${LAST_READ_PREFIX}${activeOrganizationId}` : null

  const [notifications, setNotifications] = useState<NotificationMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTabActive, setIsTabActive] = useState(true)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 100 // Increased for better persistence
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const wsRef = useRef<WebSocket | null>(null)
  const toastIdRef = useRef<string | number>("")
  const pingIntervalRef = useRef<NodeJS.Timeout>()

  // Load notifications from localStorage
  useEffect(() => {
    if (!activeOrganizationId || !storageKey) return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && lastReadKey) {
        const parsedNotifications = JSON.parse(stored)
        setNotifications(parsedNotifications)

        // Calculate unread count
        const lastRead = localStorage.getItem(lastReadKey) ?? "0"
        const lastReadTime = Number.parseInt(lastRead, 10)
        const unread = parsedNotifications.filter(
          (n: NotificationMessage) => new Date(n.created_at).getTime() > lastReadTime,
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error reading notifications from localStorage:", error)
    }
  }, [activeOrganizationId, storageKey, lastReadKey])

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible"
      setIsTabActive(isVisible)

      if (isVisible && unreadCount > 0) {
        document.title = "Dashboard" // Reset title when tab becomes active
      }

      // Reconnect if connection was closed while tab was inactive
      if (isVisible && wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("Tab became active, ensuring WebSocket connection...")
        connect()
      }
    }

    // Handle page focus/blur events for browsers that don't support visibilitychange
    const handleFocus = () => {
      setIsTabActive(true)
      // Check connection status when focus returns
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("Window regained focus, ensuring WebSocket connection...")
        connect()
      }
    }

    const handleBlur = () => setIsTabActive(false)

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [unreadCount])

  // Update document title when tab is not active
  useEffect(() => {
    if (!isTabActive && unreadCount > 0) {
      document.title = `(${unreadCount}) New Notifications`
    } else {
      document.title = "Dashboard"
    }
  }, [isTabActive, unreadCount])

  // Persist notifications to localStorage
  const persistNotifications = (newNotifications: NotificationMessage[]) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newNotifications))
    }
  }

  // WebSocket connection
  const connect = React.useCallback(() => {
    if (!activeOrganizationId) return

    // Don't reconnect if we already have an open connection
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected, skipping reconnection")
      return
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    try {
      console.log("Establishing new WebSocket connection...")
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/events/${activeOrganizationId}/`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected successfully")
        setIsConnected(true)
        reconnectAttempts.current = 0

        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current)
        }

        // Start the ping interval to keep the connection alive
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log("Sending ping to keep WebSocket alive")
            ws.send(JSON.stringify({ type: "ping" }))
          } else {
            console.log("WebSocket not open, clearing ping interval")
            clearInterval(pingIntervalRef.current)
          }
        }, 30000)
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
            setNotifications((prev) => {
              const updated = [payload, ...prev]
              persistNotifications(updated)
              return updated
            })

            // Increment unread count
            setUnreadCount((prev) => prev + 1)

            // Show toast notification
            toast(
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {payload.channel?.toLowerCase() === "whatsapp" ? (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <Bell className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    {payload.customer?.customer_name || "New notification"}
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
                    let path = "/dashboard/notifications";
                    const channel = payload.channel?.toLowerCase() || "";
                    
                    if (channel === "whatsapp") {
                      path = "/dashboard/conversations/whatsapp";
                    } else if (channel === "website") {
                      path = "/dashboard/conversations/website";
                    } else if (channel === "facebook" || channel === "messenger") {
                      path = "/dashboard/conversations/facebook";
                    } else if (channel === "instagram") {
                      path = "/dashboard/conversations/instagram";
                    } else if (channel === "email") {
                      path = "/dashboard/conversations/email";
                    }
                    
                    window.location.href = path;
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

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`)
        setIsConnected(false)
        clearInterval(pingIntervalRef.current)

        // Implement exponential backoff for reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts.current), 30000)
          reconnectAttempts.current += 1
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`)

          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        } else {
          console.log("Max reconnect attempts reached. Will try again in 60 seconds.")
          // Still try to reconnect after a longer delay
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = setTimeout(connect, 60000)
          // Reset reconnect attempts after the long delay
          reconnectAttempts.current = Math.floor(maxReconnectAttempts / 2)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        
      }
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error)
      // Try to reconnect after a delay
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = setTimeout(connect, 5000)
    }
  }, [activeOrganizationId])

  // Connect to WebSocket when component mounts or organization changes
  useEffect(() => {
    connect()

    // Cleanup function
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  // Reconnect if connection is lost due to network changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored. Reconnecting WebSocket...")
      connect()
    }

    const handleOffline = () => {
      console.log("Network connection lost. WebSocket will attempt to reconnect when online.")
      setIsConnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [connect])

  // Connection health check
  useEffect(() => {
    // Periodically check if the connection is healthy
    const healthCheckInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
        console.log("Health check: WebSocket not open, attempting to reconnect...")
        connect()
      }
    }, 60000) // Check every minute

    return () => {
      clearInterval(healthCheckInterval)
    }
  }, [connect])

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (lastReadKey) {
      localStorage.setItem(lastReadKey, Date.now().toString())
      setUnreadCount(0)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isConnected,
        unreadCount,
        markAllAsRead,
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
