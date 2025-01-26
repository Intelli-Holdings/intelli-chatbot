"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  assignedTo?: string;
  resolved: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<string[]>([]); // List of users to assign notifications
  const { user } = useUser();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`);
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Fetch users in the organization
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.map((user: { email: string }) => user.email));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchNotifications();
    fetchUsers();
  }, []);

  // Assign a notification to a user
  const assignNotification = async (notificationId: string, email: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/assign/notification/`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to assign notification");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, assignedTo: email } : n
        )
      );
    } catch (error) {
      console.error("Error assigning notification:", error);
    }
  };

  // Resolve a notification
  const resolveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/resolve/notification/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notificationId }),
        }
      );
      if (!response.ok) throw new Error("Failed to resolve notification");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, resolved: true } : n
        )
      );
    } catch (error) {
      console.error("Error resolving notification:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No notifications available.
            </p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 rounded-md border ${
                    notification.resolved
                      ? "bg-green-100"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      {notification.assignedTo && (
                        <p className="text-sm text-blue-600">
                          Assigned to: {notification.assignedTo}
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      {!notification.resolved && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => resolveNotification(notification.id)}
                          >
                            Resolve
                          </Button>
                          <select
                            onChange={(e) =>
                              assignNotification(notification.id, e.target.value)
                            }
                            defaultValue=""
                            className="border rounded p-1"
                          >
                            <option value="" disabled>
                              Assign to...
                            </option>
                            {users.map((email) => (
                              <option key={email} value={email}>
                                {email}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationsComponent;
