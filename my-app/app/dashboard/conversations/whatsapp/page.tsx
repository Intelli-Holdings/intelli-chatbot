"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ChatSidebar from "@/app/dashboard/conversations/components/chat-sidebar"
import ChatArea from "@/app/dashboard/conversations/components/chat-area"
import DownloadPage from "@/app/dashboard/conversations/components/download-page"
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import type { Conversation } from "@/app/dashboard/conversations/components/types";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";


export default function WhatsAppConvosPage() {
   const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] =
      useState<Conversation | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const activeOrganizationId = useActiveOrganizationId();
    const [loading, setLoading] = useState(false);

      useEffect(() => {
        if (!activeOrganizationId) return;
    
        async function fetchPhoneNumber() {
          try {
            const res = await fetch(
              `${API_BASE_URL}/appservice/org/${activeOrganizationId}/appservices/`
            );
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const appServices = await res.json();
            const number = appServices[0]?.phone_number || "";
            setPhoneNumber(number);
          } catch (error) {
            console.error("Failed to fetch phone number:", error);
          }
        }
    
        fetchPhoneNumber();
      }, [activeOrganizationId]);

        // Fetch conversations
        useEffect(() => {
          if (!phoneNumber) return;
      
          async function fetchConversations() {
            try {
              const res = await fetch(
                `${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${phoneNumber}/`
              );
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              const data = await res.json();
              setConversations(Array.isArray(data) ? data : []);
            } catch (error) {
              console.error("Failed to fetch conversations:", error);
              toast.error("Failed to fetch conversations");
            }
          }
      
          fetchConversations();
        }, [phoneNumber]);
      
        const handleSelectConversation = (conversation: Conversation) => {
          setSelectedConversation(conversation);
          if (isMobile) {
            setIsSheetOpen(true);
          }
        };


  return (
    <div className="flex h-screen max-h-screen overflow-hidden border rounded-xl border-gray-200">
      <ChatSidebar 
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
      loading={loading}
      />
      <div className="flex-1 relative">
      {selectedConversation ? (
        <ChatArea
        conversation={selectedConversation}
        conversations={conversations}
        phoneNumber={phoneNumber}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <DownloadPage />
        </div>
      )}
      </div>

   {/* Conversation View - Mobile */}
   {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="w-full sm:max-w-full">
              {selectedConversation && (
                <ChatArea
                  conversation={selectedConversation}
                  conversations={conversations}
                  phoneNumber={phoneNumber}
                />
              )}
            </SheetContent>
          </Sheet>
        )}
    </div>
  )
}