"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import WebsiteWidgetCard from "@/components/conversations-website";
import { useWhatsAppAppServices } from "@/hooks/use-whatsapp-appservices";
import { useWhatsAppChatSessions } from "@/hooks/use-whatsapp-chat-sessions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function StatsCards() {
  const orgId = useActiveOrganizationId();
  const {
    primaryPhoneNumber,
    isLoading: appServicesLoading,
    error: appServicesError,
  } = useWhatsAppAppServices(orgId || undefined);

  const {
    totalCount: totalWhatsAppConversations,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useWhatsAppChatSessions(orgId || undefined, primaryPhoneNumber, 12);

  const isLoading = appServicesLoading || sessionsLoading;

  if (appServicesError) {
    console.error("Failed to fetch app services:", appServicesError);
  }

  if (sessionsError) {
    console.error("Failed to fetch WhatsApp chat sessions:", sessionsError);
  }

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
          <p className="text-xs text-muted-foreground">
            {primaryPhoneNumber
              ? `Monitor conversations for ${primaryPhoneNumber}`
              : "View whatsapp chats"
            }
          </p>
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
