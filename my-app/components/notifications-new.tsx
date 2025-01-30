"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import NotificationCard from '@/components/notification-card';
import { NotificationMessage } from '@/types/notifications';
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

interface ClerkMember {
  id: string;
  publicUserData: {
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    identifier?: string | null;
    userId?: string | null;
  };
  role: string;
}

interface TeamMember {
  id: string;
  name: string;
  initials: React.ReactNode;
  imageUrl: string;
}

interface NotificationContainerProps {
  notifications: NotificationMessage[];
  teamMembers: TeamMember[];
  onAssign: (notificationId: string, userId: string) => Promise<void>;
  onResolve: (notificationId: string) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

const transformClerkMemberToTeamMember = (member: ClerkMember): TeamMember => {
  const firstName = member.publicUserData.firstName || '';
  const lastName = member.publicUserData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || member.publicUserData.identifier || 'Unknown User';
  
  return {
    id: member.id,
    name: fullName,
    initials: getInitials(firstName, lastName),
    imageUrl: member.publicUserData.imageUrl || '',
  };
};

const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';
  return (firstInitial + lastInitial).toUpperCase() || 'U';
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  teamMembers,
  onAssign,
  onResolve,
  onDelete
}: NotificationContainerProps) => {
  const { organization } = useOrganization();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        const membersList = await organization.getMemberships();
        const transformedMembers = membersList.data.map(member => 
          transformClerkMemberToTeamMember({
            id: member.id,
            publicUserData: {
              firstName: member.publicUserData?.firstName || null,
              lastName: member.publicUserData?.lastName || null,
              imageUrl: member.publicUserData?.imageUrl || null,
              identifier: member.publicUserData?.identifier || null
            },
            role: member.role
          })
        );
        setMembers(transformedMembers);
      }
    };
    loadMembers();
  }, [organization]);

  useEffect(() => {
    if (organization?.id) {
      const ws = new WebSocket(`ws://intelli-dev.onrender.com/ws/events/${organization.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        // Handle incoming notifications
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [organization?.id]);

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Notification History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[auto] pr-4 p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationCard
                    message={notification}
                    onAssign={(userId) => onAssign(notification.id, userId)}
                    onResolve={() => onResolve(notification.id)}
                    onDelete={() => onDelete(notification.id)} 
                    teamMembers={members}
                  />
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default function Notifications() {
  const { organization } = useOrganization();
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        const membersList = await organization.getMemberships({
          pageSize: 20,
          initialPage: 1
        });
        
        const transformedMembers = membersList.data.map((member) => 
          transformClerkMemberToTeamMember({
            id: member.id,
            publicUserData: {
              firstName: member.publicUserData.firstName,
              lastName: member.publicUserData.lastName,
              imageUrl: member.publicUserData.imageUrl,
              identifier: member.publicUserData.identifier
            },
            role: member.role
          })
        );
        
        setMembers(transformedMembers);
      }
    };
    loadMembers();
  }, [organization]);

  const handleAssign = async (notificationId: string, userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/assign/notification/${notificationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign notification');
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, assignee: userId, status: 'assigned' }
            : notif
        )
      );
    } catch (error) {
      console.error('Error assigning notification:', error);
    }
  };

  const handleResolve = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/resolve/notification/${notificationId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to resolve notification');
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, resolved: true, status: 'resolved' }
            : notif
        )
      );
    } catch (error) {
      console.error('Error resolving notification:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/delete/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadAssignedNotifications = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/assigned/to/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading assigned notifications:', error);
    }
  };

  return (
    <div className="p-4">
      <NotificationContainer
        notifications={notifications}
        teamMembers={members}
        onAssign={handleAssign}
        onResolve={handleResolve}
        onDelete={handleDelete}
      />
    </div>
  );
}