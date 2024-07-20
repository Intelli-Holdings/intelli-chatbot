"use client";

import { useState, useEffect } from 'react';
import ConversationList from '@/app/dashboard/conversations/components/conversationsList';
import ConversationView from '@/app/dashboard/conversations/components/conversationsView';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from '@/app/hooks/use-media-query';
import RightSidebar from '@/components/right-sidebar';
import { Conversation, ChatMessage } from '@/app/dashboard/conversations/components/types';

export default function WhatsappConvosPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('https://intelli-python-backend-lxui.onrender.com/appservice/conversations/whatsapp/chat_sessions/233553221408/');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectConversation = (customerNumber: string) => {
    const conversation = conversations.find(conv => conv.customer_number === customerNumber);
    if (conversation) {
      setSelectedConversation(conversation);
      if (isMobile) {
        setIsSheetOpen(true);
      }
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-grow w-full lg:w-3/4">
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r`}>
          <ConversationList onSelectConversation={handleSelectConversation}/>
        </div>
        {!isMobile && (
          <div className="w-2/3 overflow-hidden">
            <ConversationView conversation={selectedConversation} />
          </div>
        )}
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="h-[80vh]">
              <ConversationView conversation={selectedConversation} />
            </SheetContent>
          </Sheet>
        )}
      </div>
      {!isMobile && <div className="w-1/3"><RightSidebar /></div>}
    </div>
  );
}