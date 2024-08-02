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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Set up WebSocket connection
    const socket = new WebSocket(`${API_BASE_URL}/ws/events/`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from server:', data.message);
      
      // Add the new notification to our state
      if (data.event_type && data.message) {
        setNotifications(prevNotifications => [
          {
            id: Date.now().toString(), // Generate a temporary ID
            event_type: data.event_type,
            message: data.message,
            timestamp: new Date().toISOString()
          },
          ...prevNotifications
        ]);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const sortNotifications = () => {
    const sorted = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setNotifications(sorted);
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
              <li key={notification.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                <div>
                  <strong>{notification.event_type}:</strong> {notification.message}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}