"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { ListFilter, File } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Define the structure of a notification
interface Notification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: 'active' | 'draft' | 'archived';
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState({
    active: true,
    draft: false,
    archived: false,
  });

  useEffect(() => {
    // Function to fetch notifications from your backend
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
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

    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleFilter = (key: 'active' | 'draft' | 'archived') => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredNotifications = notifications.filter(notification => 
    (filters.active && notification.status === 'active') ||
    (filters.draft && notification.status === 'draft') ||
    (filters.archived && notification.status === 'archived')
  );

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

  const exportNotifications = () => {
    // Implement export functionality here
    console.log('Exporting notifications...');
  };

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-4">
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

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Notification Dashboard</CardTitle>
            <CardDescription>Your recent notifications</CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={filters.active}
                  onCheckedChange={() => toggleFilter('active')}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filters.draft}
                  onCheckedChange={() => toggleFilter('draft')}
                >
                  Draft
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filters.archived}
                  onCheckedChange={() => toggleFilter('archived')}
                >
                  Archived
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportNotifications}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications match your current filter settings.</p>
          ) : (
            <ul className="space-y-4">
              {filteredNotifications.map((notification) => (
                <li key={notification.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{notification.event_type}:</strong> {notification.message}
                      <div className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString()}</div>
                    </div>
                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        size="sm"
                        variant="outline"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}