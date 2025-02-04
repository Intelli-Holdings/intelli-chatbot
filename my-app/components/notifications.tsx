"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/context/notifications-context";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from 'lucide-react';
import { NotificationItem } from "@/components/notification-item";
import { toast } from "sonner";

interface Notification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  customerNumber?: string;
  customerName?: string;
  read: boolean; // Added to track if the notification has been read/resolved
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NotificationsComponent() {
  const { setNotificationCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const { user } = useUser();
  const router = useRouter(); // Initialize the router

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/appservice/list/${userEmail}/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setPhoneNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      fetchUserData(user.primaryEmailAddress.emailAddress);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications, setNotificationCount]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }

    if (!phoneNumber) return;

    const socket = new WebSocket(
      `wss://intelli-python-backend-lxui.onrender.com/ws/events/${phoneNumber}/`
    );

    socket.onopen = () => {
      console.log("WebSocket connection established");
      toast.success("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);


      const newNotification: Notification = {
        id: Date.now().toString(),
        event_type: "Customer Request",
        message: data.message,
        timestamp: new Date().toISOString(),
        customerNumber: data.message.match(/customer number : (\d+)/)?.[1],
        customerName: data.message.match(/customer name : (\w+)/)?.[1],
        read: false,
      };

      setNotifications((prevNotifications) => {
        const updatedNotifications = [newNotification, ...prevNotifications];
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket error");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      toast.info("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [phoneNumber]);

  const resolveNotification = (id: string, customerNumber?: string) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
      if (customerNumber) {
        router.push(`/dashboard/conversations/whatsapp?customerNumber=${customerNumber}`);
      }
      return updatedNotifications;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = prevNotifications.filter(
        (notification) => notification.id !== id
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
      return updatedNotifications;
    });
  };

  return (
    <Card className="">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2 ">
          <Bell className="h-6 w-6" />
          <span>Notification History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onResolve={resolveNotification}
                  onDelete={deleteNotification}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

