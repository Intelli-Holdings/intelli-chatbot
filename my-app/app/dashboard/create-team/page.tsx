"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  CreditCard,
  MessageSquare,
  Users,
  LucideIcon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Onboarding from "@/components/onboarding";
import OnboardingComponent from "@/components/onboarding";


export default function CreateTeamPage() {


  return (
    <div >   
            <OnboardingComponent />          
    </div>
  );
}
