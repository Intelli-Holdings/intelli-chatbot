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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  href: string;
}

type ChatSession = {
  id: number;
  customer_number: string;
  updated_at: string;
};

type AppService = {
  id: number;
  business: {
    id: number;
    name: string;
    slug: string;
    owner: string;
    org_id: string;
    created_at: string;
  };
  phone_number_id: string;
  phone_number: string;
  app_secret: string;
  created_at: string;
  chatsessions: ChatSession[];
  whatsapp_business_account_id: string;
};

function StatCard({ title, value, change, icon: Icon, href }: StatCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <Card className="hover:bg-accent transition-colors duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{change}</p>
              </CardContent>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to see conversations</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[100px] mb-2" />
        <Skeleton className="h-3 w-[60px]" />
      </CardContent>
    </Card>
  );
}

async function getAppServices(userEmail: string): Promise<AppService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch app services:", error);
    return [];
  }
}

function calculateChange(current: number, previous: number): string {
  if (previous === 0) return '100%';
  const changePercentage = ((current - previous) / previous) * 100;
  return `${changePercentage.toFixed(2)}%`;
}

function StatsCards({ userEmail }: { userEmail: string }) {
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAppServices(userEmail);
        setAppServices(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setAppServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userEmail]);

  let totalConversations = 0;
  let totalCustomers = new Set<string>();

  appServices.forEach(service => {
    totalConversations += service.chatsessions.length;
    service.chatsessions.forEach(session => {
      totalCustomers.add(session.customer_number);
    });
  });

  const previousConversations = 80;
  const previousCustomers = 50;

  if (isLoading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    );
  }

  return (
    <>
      <StatCard
        title="Total Conversations"
        value={`${totalConversations} conversations`}
        change={`${calculateChange(totalConversations, previousConversations)} from last month`}
        icon={MessageSquare}
        href="/dashboard/conversations/whatsapp"
      />
      <StatCard
        title="Unique Customers"
        value={`${totalCustomers.size} customers`}
        change={`${calculateChange(totalCustomers.size, previousCustomers)} from last month`}
        icon={Users}
        href=""
      />
      <StatCard
        title="Whatsapp Assistants"
        value={`${appServices.length} assistants`}
        change="Monitor your active assistants"
        icon={CreditCard}
        href=""
      />
      
    </>
  );
}

export default function ConversationsPage() {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  const userEmail = user.emailAddresses[0].emailAddress;

  return (
    <div className="container mx-auto px-4 py-8">
       <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Conversations</h1>
     
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Suspense fallback={
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            }>
              <StatsCards userEmail={userEmail} />
            </Suspense>
          </div>
        </main>
  
    </div>
  );
}
