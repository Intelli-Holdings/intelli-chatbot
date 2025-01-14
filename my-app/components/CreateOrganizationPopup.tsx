'use client';

import { useState, useEffect } from 'react';
import { useOrganizationList } from '@clerk/nextjs';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { CreateOrganization } from '@clerk/nextjs';

const CreateOrganizationPopup = () => {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const hasOrganizations = userMemberships?.data?.length > 0;
      
      if (!hasOrganizations) {
        // Only show popup if user has no organizations
        setTimeout(() => {
          setShowPopup(true);
        }, 12000); // Keep the 12 second delay
      }
    }
  }, [isLoaded, userMemberships]);

  // Don't render anything if user has organizations
  if (userMemberships && userMemberships.data && userMemberships.data.length > 0) {
    return null;
  }

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogTrigger asChild>
        <button className="hidden">Open Dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Let&apos;s get you started.</DialogTitle>
        </DialogHeader>
        <CreateOrganization
          afterCreateOrganizationUrl="/dashboard"
          skipInvitationScreen={true}
          hideSlug={true}
        />
        <DialogClose asChild>
          <button className="mt-4 text-red-500 hover:text-red-700 default-transition">
            Close
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationPopup;