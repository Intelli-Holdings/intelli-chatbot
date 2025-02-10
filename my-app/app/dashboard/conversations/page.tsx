"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Globe } from "lucide-react";
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
import useActiveOrganizationId from "@/hooks/use-organization-id";
import WebsiteWidgetCard from "@/components/conversations-website";

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

interface Message {
  id: number;
  content: string;
  answer: string;
  timestamp: string;
}

async function fetchChatSessions(phoneNumber: string): Promise<ChatSession[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${phoneNumber}/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch chat sessions:", error);
    return [];
  }
}

async function fetchAppServices(orgId: string): Promise<AppService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/appservice/org/${orgId}/appservices/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const appServices = await res.json();

    // Fetch chat sessions for each phone number
    for (const service of appServices) {
      if (service.phone_number) {
        service.chatsessions = await fetchChatSessions(service.phone_number);
      }
    }

    return appServices;
  } catch (error) {
    console.error("Failed to fetch app services:", error);
    return [];
  }
}

function StatsCards() {
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const orgId = useActiveOrganizationId();

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return; 
      try {
        const appServicesData = await fetchAppServices(orgId);
        setAppServices(appServicesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  const totalWhatsAppConversations = appServices.reduce(
    (total, service) => total + (service.chatsessions?.length || 0),
    0
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
     <Link href="/dashboard/conversations/whatsapp">
     <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Whatsapp Conversations</CardTitle>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-md">
            <Image
              src="/whatsapp.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{`${totalWhatsAppConversations} chats`}</div>
          <p className="text-xs text-muted-foreground">Monitor whatsapp conversations</p>
        </CardContent>
      </Card>

     </Link>
      

      <WebsiteWidgetCard orgId={orgId} apiBaseUrl={API_BASE_URL} />
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
          <Suspense fallback={<p>Loading...</p>}>
            <StatsCards/>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
