"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { Toaster, toast } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";

interface Notification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  customerNumber?: string;
  customerName?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { user } = useUser();

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setPhoneNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      fetchUserData(user.primaryEmailAddress.emailAddress);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    if (!phoneNumber) return;

    const socket = new WebSocket(`wss://intelli-python-backend-lxui.onrender.com/ws/events/${phoneNumber}/`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from server:', data);

      const newNotification: Notification = {
        id: Date.now().toString(),
        event_type: 'Customer Request',
        message: data.message,
        timestamp: new Date().toISOString(),
        customerNumber: data.message.match(/customer number : (\d+)/)?.[1],
        customerName: data.message.match(/customer name : (\w+)/)?.[1]
      };

      setNotifications(prevNotifications => [newNotification, ...prevNotifications]);

      // Display the notification using toast
      toast.custom(t => (
        <div className={`bg-white p-4 shadow-md rounded-md flex items-center justify-between ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div>
            <strong>{newNotification.event_type}:</strong> {newNotification.message}
            <div className="text-sm text-gray-500">{new Date(newNotification.timestamp).toLocaleString()}</div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => resolveNotification(newNotification.id)} className="text-green-500 hover:text-green-700">Resolve</button>
            <button onClick={() => toast.dismiss(t.id)} className="text-red-500 hover:text-red-700">X</button>
          </div>
        </div>
      ), { duration: 5000 });
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, [phoneNumber]);

  const resolveNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <nav className="space-x-4">
            <Link className="text-xl font-bold mb-4" href="#">
              Notification Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow p-6">
        <div className="mt-6">
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="bg-gray-100 p-4 rounded flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <strong>{notification.event_type}</strong>
                  <div className="text-sm text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
                <p>{notification.message}</p>
                {notification.customerName && (
                  <p className="text-sm text-gray-600">Customer: {notification.customerName}</p>
                )}
                {notification.customerNumber && (
                  <p className="text-sm text-gray-600">Phone: {notification.customerNumber}</p>
                )}
                <button 
                  onClick={() => resolveNotification(notification.id)}
                  className="self-end mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Resolve
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}