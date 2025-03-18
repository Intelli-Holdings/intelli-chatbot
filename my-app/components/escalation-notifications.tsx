"use client"

import React, { useState, useEffect } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, User, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssigneeDropdown } from "@/components/assignee-dropdown"

interface Notification {
  id: string
  message: string
  timestamp: string
  assignedTo?: string
  resolved: boolean
}

interface OrganizationUser {
  id: string
  identifier: string
  imageUrl?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function EscalationNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<OrganizationUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { organization } = useOrganization()

  useEffect(() => {
    fetchNotifications()
    if (organization) {
      fetchOrganizationUsers()
    }
  }, [organization])

  const fetchNotifications = async () => {
    // In a real application, you would fetch notifications from your API
    // For now, we'll use dummy data
    setNotifications([
      { id: "1", message: "Critical system error", timestamp: new Date().toISOString(), resolved: false },
      { id: "2", message: "Database connection lost", timestamp: new Date().toISOString(), resolved: false },
    ])
  }

  const fetchOrganizationUsers = async () => {
    if (organization) {
      try {
        const members = await organization.getMemberships()
        setUsers(
          members.data.map((member) => ({
            id: member.publicUserData?.userId || '',
            identifier: member.publicUserData?.identifier || '',
          })),
        )
      } catch (error) {
        console.error("Error fetching organization users:", error)
      }
    }
  }

  const assignNotification = async (notificationId: string, userId: string) => {
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
        notifications.map((notif) => (notif.id === notificationId ? { ...notif, assignedTo: userId } : notif)),
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
      setNotifications(assignedNotifications)
    } catch (error) {
      console.error("Error fetching assigned notifications:", error)
    }
  }

  const getAssignedUser = (userId?: string) => {
    return users.find((user) => user.id === userId)
  }

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.assignedTo &&
        getAssignedUser(notification.assignedTo)?.identifier.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Escalation Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notifications or assigned users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <ScrollArea className="h-[400px] pr-4">
          {filteredNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications found</p>
          ) : (
            <ul className="space-y-4">
              {filteredNotifications.map((notification) => {
                const assignedUser = getAssignedUser(notification.assignedTo)
                return (
                  <li
                    key={notification.id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.resolved && (
                          <AssigneeDropdown
                            users={users}
                            onAssign={(userId) => assignNotification(notification.id, userId)}
                            disabled={!!notification.assignedTo}
                          />
                        )}
                      </div>
                    </div>
                    {assignedUser && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignedUser.imageUrl} />
                          <AvatarFallback className="bg-purple-500 text-xs">
                            {assignedUser.identifier.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Assigned to {assignedUser.identifier}
                        </span>
                      </div>
                    )}
                    {notification.assignedTo && !notification.resolved && (
                      <Button
                        onClick={() => resolveNotification(notification.id)}
                        className="mt-3 w-full"
                        variant="outline"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                    {notification.resolved && (
                      <div className="mt-3 flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Resolved</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
