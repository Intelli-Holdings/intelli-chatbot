"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrganizationList, useOrganization } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { any } from "zod";

export default function Page() {
  const { isLoaded, setActive, userMemberships, userInvitations, userSuggestions } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const handleCreateOrganization = () => {
    handleCreateOrganization : any
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <h1 className="text-2xl font-bold mb-6">Organizations</h1>
      <div className="flex flex-col">

        <div className="grid gap-4 p-4 md:gap-8 md:p-6">
          <div className="bg-white p-4 rounded-lg shadow">
           
            {userMemberships.data?.length > 0 ? (
              <>
                <ul>
                  {userMemberships.data.map((mem) => (
                    <li key={mem.id}>
                      <span>{mem.organization.name}</span>
                      <button
                        onClick={() => setActive({ organization: mem.organization.id })}
                      >
                        Select
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={!userMemberships.hasNextPage}
                  onClick={() => userMemberships.fetchNext()}
                >
                  Load more organizations
                </button>
              </>
            ) : (
              <div>
                <p>You are not a member of any organizations.</p>
                <Button onClick={handleCreateOrganization}>Create New Organization</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}