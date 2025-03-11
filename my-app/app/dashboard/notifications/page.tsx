'use client';

import React, { useState, useEffect } from 'react';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { useNotifications } from '@/hooks/use-notification';
import { ClerkMember, TeamMember } from '@/types/notification';
import Notifications from './Notifications';
import { memberUtils } from '@/utils/members';

const NotificationPage: React.FC = () => {
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: { infinite: true } });
  const { notifications, isConnected } = useNotifications();
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    console.log('Notifications:', notifications);
    console.log('Members:', members);
    console.log('Is Connected:', isConnected);
    
    const loadMembers = async () => {
      if (organization) {
        try {
          const membersList = await organization.getMemberships();
          const transformedMembers = membersList.data.map((member: ClerkMember) =>
            memberUtils.transform(member)
          );
          setMembers(transformedMembers);
        } catch (error) {
          console.error('Failed to fetch members:', error);
        }
      }
    };
    loadMembers();
  }, [organization]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Notifications</h1>
      <Notifications notifications={notifications} members={members} />
    </div>
  );
};

export default NotificationPage;
