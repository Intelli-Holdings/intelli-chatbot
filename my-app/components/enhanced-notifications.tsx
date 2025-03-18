"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Notification {
  id: string
  event_type: string
  message: string
  timestamp: string
  assignedTo?: string
  resolved: boolean
}

interface User {
  email: string
  name: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function EnhancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const { user } = useUser()

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [])

  const fetchNotifications = async () => {
    // Fetch notifications from your API
    // For now, we'll use dummy data
    setNotifications([
      {
        id: "1",
        event_type: "Error",
        message: "System crash detected",
        timestamp: new Date().toISOString(),
        resolved: false,
      },
      {
        id: "2",
        event_type: "Warning",
        message: "High CPU usage",
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ])
  }

  const fetchUsers = async () => {
    // Fetch users from your API
    // For now, we'll use dummy data
    setUsers([
      { email: "user1@example.com", name: "User 1" },
      { email: "user2@example.com", name: "User 2" },
    ])
  }

  const assignNotification = async (notificationId: string, userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/assign/notification/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to assign notification")
      }

      setNotifications(
        notifications.map((notif) => (notif.id === notificationId ? { ...notif, assignedTo: userEmail } : notif)),
      )
    } catch (error) {
      console.error("Error assigning notification:", error)
    }
  }

  const resolveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/resolve/notification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) {
        throw new Error("Failed to resolve notification")
      }

      setNotifications(
        notifications.map((notif) => (notif.id === notificationId ? { ...notif, resolved: true } : notif)),
      )
    } catch (error) {
      console.error("Error resolving notification:", error)
    }
  }

  const fetchAssignedNotifications = async (userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/assigned/to/${userEmail}/`)
      if (!response.ok) {
        throw new Error("Failed to fetch assigned notifications")
      }
      const assignedNotifications = await response.json()
      // Update the state with assigned notifications
      setNotifications(assignedNotifications)
    } catch (error) {
      console.error("Error fetching assigned notifications:", error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Enhanced Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id} className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold">{notification.event_type}</p>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                  {!notification.assignedTo && (
                    <Select onValueChange={(value) => assignNotification(notification.id, value)}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.email} value={user.email}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {notification.assignedTo && !notification.resolved && (
                    <Button onClick={() => resolveNotification(notification.id)} className="mt-2 w-full">
                      Resolve
                    </Button>
                  )}
                  {notification.resolved && <p className="text-green-500 mt-2">Resolved</p>}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
      {user && (
        <Button
          onClick={() => fetchAssignedNotifications(user.primaryEmailAddress?.emailAddress || "")}
          className="mt-4 w-full"
        >
          View My Assigned Notifications
        </Button>
      )}
    </Card>
  )
}

