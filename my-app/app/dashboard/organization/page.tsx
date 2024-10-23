"use client";
import React from "react";
import { ClerkLoading, CreateOrganization } from "@clerk/nextjs"
import { CustomCreateOrganizationForm } from "@/components/CreateOrganization"
import { MyMemberships } from "@/components/OrganizationList"
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
      <div className="flex w-full flex-col">

      <ClerkLoading>Loading ...</ClerkLoading>
      <h1 className="mb-4 mt-20">Fill in this form to create your organization</h1>
        <CreateOrganization skipInvitationScreen={true} />
        <h2 className="mb-4 mt-8">List of your organizations</h2>
        <MyMemberships />
      </div>
    </div>
  );
}