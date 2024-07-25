"use client";
import React from "react";
import Link from "next/link";
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
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/organization">Organization</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:gap-8 md:p-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Organizations</h2>
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
                <button onClick={handleCreateOrganization}>Create New Organization</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}