"use client";
import Link from "next/link";
import ReservationsTable from "@/app/dashboard/reservations/ReservationsTable";
import { InviteEmployee } from "@/components/invite-employee";
import { TeamMembers } from "@/components/team-members";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/search";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  File,
  ListFilter,
  X,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import React, { useEffect, useState } from "react";
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
                    <Link href="/dashboard/employees">Employees</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
               
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:gap-8 md:p-6">
       
        <InviteEmployee />
        <EmployeeList />
        <TeamMembers />       
        </div>

      </div>
    </div>
  );
};

