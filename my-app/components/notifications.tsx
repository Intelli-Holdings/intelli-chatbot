"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

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
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
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
    <div className="flex flex-col min-h-screen">
      <Card>
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <nav className="space-x-4">
            <Link className="text-xl font-bold mb-4" href="#">
              Notification Stream
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow p-6">
        <div className="mt-6">
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`bg-gray-100 p-4 rounded flex flex-col ${
                  notification.read ? "text-gray-500" : "text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {notification.customerNumber || "Unknown"}
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button
                        onClick={() =>
                          resolveNotification(notification.id, notification.customerNumber)
                        }
                        className="ml-auto gap-1"
                        aria-label="Resolve notification"
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        resolveNotification(notification.id, notification.customerNumber)
                      }
                      className="text-green-500 hover:text-green-700"
                    >
                      Resolve
                    </Button>
                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="text-md font-medium">
                  {notification.message || "No messages yet"}
                </div>
                {notification.customerName && (
                  <p className="text-sm text-gray-600">
                    Customer: {notification.customerName}
                  </p>
                )}
                {notification.customerNumber && (
                  <p className="text-sm text-gray-600">
                    Phone: {notification.customerNumber}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>

      </Card>
      
    </div>
  );
}
