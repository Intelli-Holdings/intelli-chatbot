import { useEffect, useRef, useState } from 'react';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';

const useActiveOrganizationId = () => {
  const { organization } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const hasSetActiveRef = useRef(false);
  const setActiveRef = useRef(setActive);
  setActiveRef.current = setActive;

  // Derive a stable primitive from the memberships data
  const fallbackOrgId = userMemberships?.data?.[0]?.organization.id ?? null;

  useEffect(() => {
    if (organization?.id) {
      setActiveOrganizationId(organization.id);
      hasSetActiveRef.current = true;
      return;
    }

    if (!isLoaded || hasSetActiveRef.current) return;

    if (fallbackOrgId) {
      setActiveOrganizationId(fallbackOrgId);
      if (setActiveRef.current) {
        void setActiveRef.current({ organization: fallbackOrgId });
      }
      hasSetActiveRef.current = true;
    }
  }, [organization?.id, isLoaded, fallbackOrgId]);

  return activeOrganizationId;
};

export default useActiveOrganizationId;
