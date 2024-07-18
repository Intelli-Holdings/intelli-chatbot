"use client";
import Link from "next/link";
import { InviteEmployee } from "@/components/invite-employee";
import { TeamMembers } from "@/components/team-members";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


import React from "react";
import { EmployeeList } from "@/components/get-employees";


export default function Page () {
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
   
        </div>
      </div>
    </div>
  );
};

