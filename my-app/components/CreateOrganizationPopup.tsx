"use client";
import { useState } from "react";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { CreateOrganization } from "@clerk/nextjs";

const CreateOrganizationPopup = () => {
  const { user } = useUser();
  const { userMemberships } = useOrganizationList(); // Access the userMemberships field
  const [showPopup, setShowPopup] = useState(true);

  // Handle successful organization creation
  const handleCreateOrganization = () => {
    setShowPopup(false); // Close the popup when organization is created
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50 transition-all ${
        showPopup ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-lg font-regular mb-4">Let&apos;s get you started now that you have signed up</h2>
        <CreateOrganization
          afterCreateOrganizationUrl="/dashboard"
          skipInvitationScreen={true}
          hideSlug={true}
        />
        <button
          className="mt-4 text-red-500 hover:text-red-700 default-transition"
          onClick={() => setShowPopup(false)} // Close the popup manually
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreateOrganizationPopup;
