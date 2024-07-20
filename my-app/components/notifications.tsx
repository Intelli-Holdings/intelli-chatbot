"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from 'react';

// Define the structure of a notification
interface Notification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Function to fetch notifications from your backend
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications'); // Adjust this URL to your backend endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set up an interval to periodically fetch new notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const sortNotifications = () => {
    const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setNotifications(sorted);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/mark-read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <Link className="text-2xl font-bold text-gray-800" href="#">
            Dashboard
          </Link>
          <nav className="space-x-4">
            <Link className="text-gray-600 hover:text-gray-800" href="#">
              Notifications
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">Notification Dashboard</h1>
          <button 
            onClick={sortNotifications}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sort by Time
          </button>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className={`bg-gray-100 p-2 rounded flex justify-between items-center ${notification.read ? 'opacity-50' : ''}`}>
                <div>
                  <strong>{notification.event_type}:</strong> {notification.message}
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}