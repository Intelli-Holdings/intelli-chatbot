"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from 'react';
import ConversationList from '@/app/dashboard/conversations/components/conversationsList';
import ConversationView from '@/app/dashboard/conversations/components/conversationsView';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from '@/app/hooks/use-media-query';
import RightSidebar from '@/components/right-sidebar';
import { Conversation, ChatMessage } from '@/app/dashboard/conversations/components/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WhatsappConvosPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useUser();

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setPhoneNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!phoneNumber) return;
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${phoneNumber}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
    <div className="flex max-h-[920px] border border-dotted border-double border-gray-200 rounded-xl shadow-md">
      <div className="flex-1 flex overflow-hidden ">
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r`}>
          <ConversationList onSelectConversation={handleSelectConversation}/>
        </div>
        {!isMobile && (
          <div className="flex-1 overflow-y-auto">          
            <ConversationView conversation={selectedConversation} conversations={conversations} />
          </div>
        )}
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="w-full sm:max-w-full">
              {selectedConversation && (
                <ConversationView conversation={selectedConversation} conversations={conversations} />
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}

