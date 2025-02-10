"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import ConversationList from "@/app/dashboard/conversations/components/conversationsList";
import ConversationView from "@/app/dashboard/conversations/components/conversationsView";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { Conversation } from "@/app/dashboard/conversations/components/types";
import { toast } from "sonner";
import useActiveOrganizationId from "@/hooks/use-organization-id";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchChatSessions(phoneNumber: string): Promise<Conversation[]> {
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

async function fetchPhoneNumber(orgId: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/appservice/org/${orgId}/appservices/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const appServices = await res.json();
    return appServices[0]?.phone_number || "";
  } catch (error) {
    console.error("Failed to fetch phone number:", error);
    return "";
  }
}

export default function WhatsappConvosPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const activeOrganizationId = useActiveOrganizationId();

  useEffect(() => {
    if (activeOrganizationId) {
      fetchPhoneNumber(activeOrganizationId).then(setPhoneNumber);
    }
  }, [activeOrganizationId]);

  const fetchConversations = useCallback(async (orgId: string) => {
    if (!phoneNumber) return;
    try {
      const data = await fetchChatSessions(phoneNumber);
      setConversations(data || []); // Ensure `data` is an array
    } catch (error) {
      toast.error("Failed to fetch conversations");
      console.error("Error fetching conversations:", error);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber && activeOrganizationId) {
      fetchConversations(activeOrganizationId);
    }
  }, [phoneNumber, fetchConversations, activeOrganizationId]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setIsSheetOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex-1 flex overflow-hidden h-screen border border-gray-100">
        <div className={`${isMobile ? "w-full" : "w-1/3"} `}>
          <ConversationList conversations={conversations} onSelectConversation={handleSelectConversation} />
        </div>
        {!isMobile && (
          <div className="flex-1 overflow-y-auto">
           <ConversationView 
              conversation={selectedConversation} 
              conversations={conversations}
              phoneNumber={phoneNumber} 
            />
          </div>
        )}
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="w-full sm:max-w-full">
            {selectedConversation && (
                <ConversationView 
                  conversation={selectedConversation}
                  conversations={conversations}
                  phoneNumber={phoneNumber}
                />
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
