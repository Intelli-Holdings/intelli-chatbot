"use client";

import { useState, useEffect } from 'react';
import ConversationList from '@/app/dashboard/conversations/components/conversationsList';
import ConversationView from '@/app/dashboard/conversations/components/conversationsView';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from '@/app/hooks/use-media-query';

interface ChatMessage {
  content: string | null;
  answer: string;
  created_at: string;
  sender: string | null;
  chatsession: {
    customer_number: string;
    updated_at: string;
  };
}

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: ChatMessage[];
  created_at: string;
  customer_number?: string;
}

export default function WhatsappConvosPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('15556221967');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSelectConversation = async (customerNumber: string) => {
    const response = await fetch(`https://intelli-python-backend-56zq.onrender.com/appservice/conversations/whatsapp/chat_sessions/15556221967/254751578687/`);
    const data = await response.json();
  
    // Create a Conversation object with the fetched data
    const conversation: Conversation = {
      id: 1, // You need to determine the actual ID from your data or API response
      sender_id: '15556221967', // Replace with actual sender ID if available
      recipient_id: customerNumber,
      chat_history: data,
      created_at: new Date().toISOString(), // Replace with actual creation date if available
      customer_number: customerNumber,
    };
  
    setSelectedConversation(conversation);
    if (isMobile) {
      setIsSheetOpen(true);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col w-full">
        <div className="flex flex-grow">
          <div className={`${isMobile ? 'w-full' : 'w-1/4'} border-r`}>
            <ConversationList onSelectConversation={handleSelectConversation} phoneNumber={phoneNumber} />
          </div>
          {!isMobile && (
            <div className="w-2/3">
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
      </div>
    </div>
  );
}