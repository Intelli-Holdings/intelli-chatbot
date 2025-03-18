"use client";

import { Contacts } from "@/components/contacts";
import { ContactsHeader } from "@/components/contacts-header";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Conversation } from "@/app/dashboard/conversations/components/types";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ContactsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  
  const activeOrganizationId = useActiveOrganizationId();

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

  useEffect(() => {
    if (activeOrganizationId) {
      setIsLoading(true);
      fetchPhoneNumber(activeOrganizationId)
        .then(setPhoneNumber)
        .finally(() => setIsLoading(false));
    }
  }, [activeOrganizationId]);

  const fetchConversations = useCallback(async (orgId: string) => {
    if (!phoneNumber) return;
    try {
      setIsLoading(true);
      const data = await fetchChatSessions(phoneNumber);
      setConversations(data || []); // Ensure data is an array
    } catch (error) {
      toast.error("Failed to fetch conversations");
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (phoneNumber && activeOrganizationId) {
      fetchConversations(activeOrganizationId);
    }
  }, [phoneNumber, fetchConversations, activeOrganizationId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
        Contacts
      </h1>
      <div className="flex w-full flex-col">
      <ContactsHeader onSearchChange={setSearchTerm} />
    <Contacts 
      conversations={conversations}
      phoneNumber={phoneNumber}
      searchTerm={searchTerm}
    />
      </div>
    </div>
  );
}

