"use client";

import { useState } from 'react';
import ConversationList from '@/app/dashboard/conversations/components/conversationsList';
import ConversationView from '@/app/dashboard/conversations/components/conversationsView';


interface ChatHistoryItem {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: ChatHistoryItem[];
  created_at: string;
}

export default function WhatsappConvosPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col w-full">
      <div className="border-b">
        </div>
        <div className="flex flex-grow">
          <div className="w-1/3 border-r">
            <ConversationList onSelectConversation={handleSelectConversation} />
          </div>
          <div className="w-2/3">
            <ConversationView conversation={selectedConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
