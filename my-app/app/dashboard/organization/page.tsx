"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { EmployeeList } from "@/components/get-employees";

// Type for our organization data
interface OrganizationData {
  // Define the structure of your organization data here
  // For example:
  name: string;
  // Add other fields as necessary
}

export default function Page() {
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch('https://accounts.intelliconcierge.com/organization');
        if (!response.ok) {
          throw new Error('Failed to fetch organization data');
        }
        const data: OrganizationData = await response.json();
        setOrganizationData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, []);

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
            <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
            {isLoading ? (
              <p>Loading organization data...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : organizationData ? (
              <pre>{JSON.stringify(organizationData, null, 2)}</pre>
            ) : (
              <p>No organization data available.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}