import React, { useState, useEffect } from 'react';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_API_URL = 'https://intelli-python-backend-lxui.onrender.com';

interface Message {
  id: number;
  content: string;
  answer: string;
  created_at: string;
  sender: string;
}

interface Conversation {
  id: number;
  customer_number: string;
  messages: Message[];
  updated_at: string;
}

interface ConversationListProps {
  onSelectConversation: (customerNumber: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/appservice/conversations/whatsapp/chat_sessions/233553221408/`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data: Conversation[] = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.customer_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonLoader = () => (
    <div className="flex flex-col space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <Skeleton className="h-4 w-1/5 mt-1" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>
      <ScrollArea className="flex flex-col p-4 space-y-4 overflow-y-auto">
        <div className="flex w-full flex-col gap-1">
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="block p-4 border rounded-lg hover:none cursor-pointer"
                onClick={() => onSelectConversation(conversation.customer_number)}
              >
                <div className="flex justify-between">
                  <span className="text-s font-medium">Customer Contact: {conversation.customer_number}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(conversation.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Messages: {conversation.messages.length}
                </div>
              </div>
            ))
          )}
        </div>
        <Scrollbar orientation="vertical" />
      </ScrollArea>
    </>
  );
}

export default ConversationList;