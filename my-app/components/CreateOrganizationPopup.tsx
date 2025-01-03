"use client";
import { useState, useEffect } from "react";
import { useUser, useOrganizationList, CreateOrganization } from "@clerk/nextjs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const CreateOrganizationPopup = () => {
  const { user } = useUser();
  const { isLoaded, userMemberships } = useOrganizationList(); // Access the userMemberships field
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const hasOrganizations = userMemberships?.data?.length > 0;
      const popupShown = localStorage.getItem('popupShown');

      if (!hasOrganizations && !popupShown) {
        setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem('popupShown', 'true');
        }, 10000); // Delay showing the popup by 10 seconds
      }
    }
  }, [isLoaded, userMemberships]);

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