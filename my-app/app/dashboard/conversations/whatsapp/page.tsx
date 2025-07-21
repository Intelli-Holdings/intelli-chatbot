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
import LoadingProgress from "@/components/loading-progress";

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
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isInitializing, setIsInitializing] = useState(true);

      useEffect(() => {
        if (!activeOrganizationId) return;
    
        async function fetchPhoneNumber() {
          try {
            setLoadingMessage("Fetching phone configuration...");
            setLoadingProgress(20);
            
            const res = await fetch(
              `/api/appservice/paginated/org/${activeOrganizationId}/appservices/`
            );
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const number = data.results?.[0]?.phone_number || "";
            setPhoneNumber(number);
            
            setLoadingProgress(40);
            setLoadingMessage("Phone configuration loaded");
          } catch (error) {
            console.error("Failed to fetch phone number:", error);
            toast.error("Failed to fetch phone configuration");
          }
        }
    
        fetchPhoneNumber();
      }, [activeOrganizationId]);

        // Fetch initial conversations
        useEffect(() => {
          if (!phoneNumber || !activeOrganizationId) return;
      
          async function fetchConversations() {
            setLoading(true);
            setLoadingProgress(50);
            setLoadingMessage("Loading conversations...");
            
            try {
              const startTime = Date.now();
              const res = await fetch(
                `/api/appservice/paginated/conversations/whatsapp/chat_sessions/org/${activeOrganizationId}/${phoneNumber}/?page=1&page_size=12`
              );
              
              setLoadingProgress(75);
              setLoadingMessage("Processing chat data...");
              
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              const data = await res.json();
              
              setLoadingProgress(90);
              setLoadingMessage("Preparing conversations...");
              
              const conversationsWithMessages = (data.results || []).map((conv: any) => ({
                ...conv,
                messages: [], // Initialize with empty messages array
                phone_number: phoneNumber,
                recipient_id: conv.customer_number,
                attachments: []
              }));
              
              setConversations(conversationsWithMessages);
              setHasMore(data.next !== null);
              setPage(1);
              
              setLoadingProgress(100);
              setLoadingMessage("Ready!");
              
              // Small delay to show completion
              setTimeout(() => {
                setIsInitializing(false);
              }, 500);
              
            } catch (error) {
              console.error("Failed to fetch conversations:", error);
              toast.error("Failed to fetch conversations");
              setIsInitializing(false);
            } finally {
              setLoading(false);
            }
          }
      
          fetchConversations();
        }, [phoneNumber, activeOrganizationId]);

        // Function to load more conversations
        const loadMoreConversations = async () => {
          if (!phoneNumber || !activeOrganizationId || !hasMore || isLoadingMore) return;
          
          setIsLoadingMore(true);
          try {
            const nextPage = page + 1;
            const res = await fetch(
              `/api/appservice/paginated/conversations/whatsapp/chat_sessions/org/${activeOrganizationId}/${phoneNumber}/?page=${nextPage}&page_size=12`
            );
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const newConversationsWithMessages = (data.results || []).map((conv: any) => ({
              ...conv,
              messages: [], // Initialize with empty messages array
              phone_number: phoneNumber,
              recipient_id: conv.customer_number,
              attachments: []
            }));
            
            setConversations(prev => [...prev, ...newConversationsWithMessages]);
            setHasMore(data.next !== null);
            setPage(nextPage);
          } catch (error) {
            console.error("Failed to load more conversations:", error);
            toast.error("Failed to load more conversations");
          } finally {
            setIsLoadingMore(false);
          }
        };
      
        const handleSelectConversation = (conversation: Conversation) => {
          setSelectedConversation(conversation);
          if (isMobile) {
            setIsSheetOpen(true);
          }
        };


  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen max-h-screen overflow-hidden border rounded-xl border-gray-200">
        <div className="flex-1 flex items-center justify-center">
          <LoadingProgress 
            isLoading={true} 
            loadingType="initial" 
            currentProgress={loadingProgress}
            message={loadingMessage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden border rounded-xl border-gray-200">
      <ChatSidebar 
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
      loading={loading}
      hasMore={hasMore}
      loadMore={loadMoreConversations}
      isLoadingMore={isLoadingMore}
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