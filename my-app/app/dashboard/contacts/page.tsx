"use client";

import { Contacts } from "@/components/contacts";
import { ContactsHeader } from "@/components/contacts-header";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Conversation } from "@/app/dashboard/conversations/components/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ContactsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();

  useEffect(() => {
    async function fetchData() {
      if (!user?.primaryEmailAddress) return;

      try {
        setIsLoading(true);
        // First get the phone number
        const userResponse = await fetch(
          `${API_BASE_URL}/appservice/list/${user.primaryEmailAddress.emailAddress}/`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();

        if (!userData?.[0]?.phone_number) return;

        setPhoneNumber(userData[0].phone_number);

        // Then get the conversations
        const conversationsResponse = await fetch(
          `${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${userData[0].phone_number}/`
        );
        if (!conversationsResponse.ok)
          throw new Error("Failed to fetch conversations");
        const conversationsData = await conversationsResponse.json();

        setConversations(conversationsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

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

