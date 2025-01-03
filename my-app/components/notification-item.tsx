import { Notification } from '@/types/notification';
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Trash2 } from 'lucide-react';

interface NotificationItemProps {
  notification: LocalNotification;
  onResolve: (id: string, customerNumber?: string) => void;
  onDelete: (id: string) => void;
}

interface LocalNotification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  customerNumber?: string;
  customerName?: string;
  read: boolean;
}

export function NotificationItem({ notification, onResolve, onDelete }: NotificationItemProps) {
  return (
    <li className={`bg-card rounded-lg p-4 shadow-sm transition-all ${
      notification.read ? "opacity-60" : ""
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{notification.customerName || "Unknown Customer"}</h3>
          <p className="text-sm text-muted-foreground">{notification.customerNumber || "No phone number"}</p>
        </div>
        <Badge variant={notification.read ? "secondary" : "default"}>
          {notification.read ? "Resolved" : "New"}
        </Badge>
      </div>
      <p className="text-sm mb-2">{notification.message}</p>
      <div className="text-xs text-muted-foreground mb-2">
        {new Date(notification.timestamp).toLocaleString()}
      </div>
      <Separator className="my-2" />
      <div className="flex justify-end space-x-2">
        {!notification.read && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(notification.id, notification.customerNumber)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Resolve
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </li>
  );
}

export default NotificationItem;

