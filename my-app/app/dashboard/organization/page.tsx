"use client";
import { CreateOrganization } from "@clerk/nextjs"
import { JoinedOrganizations } from "@/components/MyOrganizations";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">Organizations</h1>
      <div className="flex w-full flex-col">
       
        <JoinedOrganizations />
      </div>
    </div>
  );
}