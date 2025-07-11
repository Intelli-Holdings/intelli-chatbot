"use client";
import { ClerkLoading, CreateOrganization } from "@clerk/nextjs";
import { useOrganizationList, useOrganization } from "@clerk/nextjs";

export default function CreateOrganizationStep() {
  const {
    isLoaded,
    setActive,
    userMemberships,
    userInvitations,
    userSuggestions,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex justify-center">
      <ClerkLoading>Loading ...</ClerkLoading>

      <CreateOrganization
        afterCreateOrganizationUrl="/onboarding"
        skipInvitationScreen={false}
        hideSlug={true}
      />
    </div>
  );
}
