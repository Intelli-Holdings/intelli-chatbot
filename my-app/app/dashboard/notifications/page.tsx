'use client';

import { useState, useEffect } from 'react';
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { NotificationContainer } from '@/app/dashboard/notifications/NotificationContainer';
import { NotificationService } from '@/services/notifications';
import { memberUtils } from '@/utils/members';
import { useNotifications } from '@/hooks/use-notification';
import { ClerkMember, TeamMember } from '@/types/notification';

export default function NotificationPage() {
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: { infinite: true } });
  const { notifications, setNotifications, isConnected } = useNotifications();
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        const membersList = await organization.getMemberships({ 
          pageSize: 20,
          initialPage: 1
        });
        
        const transformedMembers = membersList.data.map((member: ClerkMember) => 
          memberUtils.transform(member)
        );
        
        setMembers(transformedMembers);
      }
    };
    loadMembers();
  }, [organization]);

  const handleAssign = async (notificationId: string, userId: string) => {
    await NotificationService.assign(userId);
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, assignee: userId, status: 'assigned' } : notif
      )
    );
  };

  const handleResolve = async (notificationId: string) => {
    await NotificationService.resolve();
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, resolved: true, status: 'resolved' } : notif
      )
    );
  };

  const handleDelete = async (notificationId: string) => {
    await NotificationService.delete();
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  return (
    <div className="container mx-auto px-4 py-8 p-4">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Notifications</h1>
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