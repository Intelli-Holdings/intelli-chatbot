"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Globe, LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Interfaces
interface ChatSession {
  id: number;
  customer_number: string;
  updated_at: string;
}

interface AppService {
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
}

interface Widget {
  id: number;
  widget_name: string;
  widget_key: string;
}

interface Message {
  id: number;
  content: string;
  answer: string;
  timestamp: string;
}

interface Visitor {
  id: number;
  visitor_id: string;
  visitor_email: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  ip_address: string;
  created_at: string;
  last_seen: string;
  messages: Message[];
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

// Components
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

function LoadingSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-[100px] bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4 bg-gray-100 rounded-full animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-[100px] bg-gray-100 rounded mb-2 animate-pulse" />
        <div className="h-3 w-[60px] bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

async function fetchAppServices(userEmail: string): Promise<AppService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch app services:", error);
    return [];
  }
}

function StatsCards({ userEmail }: { userEmail: string }) {
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch WhatsApp data
        const appServicesData = await fetchAppServices(userEmail);
        setAppServices(appServicesData);

        // Fetch widgets
        const widgetsResponse = await fetch(`${API_BASE_URL}/widgets/`);
        if (!widgetsResponse.ok) {
          throw new Error(`Failed to fetch widgets: ${widgetsResponse.statusText}`);
        }
        const widgetsData = await widgetsResponse.json();
        setWidgets(widgetsData);

        // Fetch visitors for first widget
        if (widgetsData.length > 0) {
          const firstWidgetKey = widgetsData[0].widget_key;
          const visitorsResponse = await fetch(
            `${API_BASE_URL}/widgets/${firstWidgetKey}/visitors/`
          );
          if (!visitorsResponse.ok) {
            throw new Error(`Failed to fetch visitors: ${visitorsResponse.statusText}`);
          }
          const visitorsData = await visitorsResponse.json();
          setVisitors(visitorsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAppServices([]);
        setWidgets([]);
        setVisitors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  // Calculate stats
  const totalWhatsAppConversations = appServices.reduce(
    (total, service) => total + service.chatsessions.length,
    0
  );

  const totalWebsiteMessages = visitors.reduce(
    (total, visitor) => total + visitor.messages.length,
    0
  );

  if (isLoading) {
    return (
      <>
        <LoadingSkeleton />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <StatCard
        title="Whatsapp Conversations"
        value={`${totalWhatsAppConversations} conversations`}
        change="Monitor your whatsapp conversations"
        icon={({ className }) => (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-md">
            <Image
              src="/whatsapp.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        )}              
        href="/dashboard/conversations/whatsapp"
      />
      
      <StatCard
        title="Website Widget Conversations"
        value={`${totalWebsiteMessages} messages`}
        change={`From ${visitors.length} visitors`}
        icon={
          ({ className }) => (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-green-500 shadow-md ">
              <Globe />
            </div>
          )}
        href="/dashboard/conversations/website"
      />
    </>
  );
}

export default function ConversationsPage() {
  const { user } = useUser();

  if (!user) {
    return <div>Loading user...</div>;
  }

  const userEmail = user.emailAddresses[0].emailAddress;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
        Conversations
      </h1>
      
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Suspense fallback={
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          }>
            <StatsCards userEmail={userEmail} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}