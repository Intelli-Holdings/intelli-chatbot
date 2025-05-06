import { ClerkMember, TeamMember } from '@/types/notification';

export const memberUtils = {
  transform: (member: ClerkMember): TeamMember => {
    const firstName = member.publicUserData.firstName || '';
    const lastName = member.publicUserData.lastName || '';
    return {
      id: member.id,
      name: `${firstName} ${lastName}`.trim() || member.publicUserData.identifier || 'Unknown User',
      initials: memberUtils.getInitials(firstName, lastName),
      imageUrl: member.publicUserData.imageUrl || '',
      email: member.publicUserData.identifier || '',
    };
  },

  getInitials: (firstName: string, lastName: string): string => {
    return [firstName?.[0], lastName?.[0]].join('').toUpperCase() || 'U';
  },
};