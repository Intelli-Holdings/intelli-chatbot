"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import ConversationList from "@/app/dashboard/conversations/components/conversationsList";
import ConversationView from "@/app/dashboard/conversations/components/conversationsView";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { Conversation } from "@/app/dashboard/conversations/components/types";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WhatsappConvosPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useUser();

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      if (data && data.length > 0 && data[0].phone_number) {
        setPhoneNumber(data[0].phone_number);
      } else {
        throw new Error("Phone number not found in the response");
      }
    } catch (error) {
      setError((error as Error).message);
      console.error("Error fetching user data:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!phoneNumber) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${phoneNumber}/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data: Conversation[] = await response.json();
      setConversations(data || []); // Ensure `data` is an array
    } catch (error) {
      toast.error("Failed to fetch conversations");
      console.error("Error fetching conversations:", error);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      fetchUserData(user.primaryEmailAddress.emailAddress);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    if (phoneNumber) {
      fetchConversations();
    }
  }, [phoneNumber, fetchConversations]);

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
