import { useEffect, useState } from 'react';
import { useOrganizationList } from '@clerk/nextjs';

const useActiveOrganizationId = () => {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      // Assuming the first organization is the active one; adjust logic as needed
      setActiveOrganizationId(userMemberships.data[0].organization.id);
    }
  }, [isLoaded, userMemberships.data]);

  return activeOrganizationId;
};

export default useActiveOrganizationId;
