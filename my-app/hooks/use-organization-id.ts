import { useEffect, useRef, useState } from 'react';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';

const useActiveOrganizationId = () => {
  const { organization } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const hasSetActiveRef = useRef(false);

  useEffect(() => {
    if (organization?.id) {
      setActiveOrganizationId(organization.id);
      hasSetActiveRef.current = true;
      return;
    }

    if (!isLoaded || hasSetActiveRef.current) return;

    const fallbackOrgId = userMemberships.data?.[0]?.organization.id;
    if (fallbackOrgId) {
      setActiveOrganizationId(fallbackOrgId);
      if (setActive) {
        void setActive({ organization: fallbackOrgId });
      }
      hasSetActiveRef.current = true;
    }
  }, [organization?.id, isLoaded, setActive, userMemberships.data]);

  return activeOrganizationId;
};

export default useActiveOrganizationId;
