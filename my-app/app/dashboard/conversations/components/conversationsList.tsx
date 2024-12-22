import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const userEmail = user.emailAddresses[0].emailAddress;
        const accountResponse = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account data');
        }
        const accountData = await accountResponse.json();
        const phoneNumber = accountData[0]?.phone_number;

        if (!phoneNumber) {
          throw new Error('Phone number not found');
        }

        const conversationsResponse = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/chat_sessions/${phoneNumber}/`);
        if (!conversationsResponse.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const conversationsData: Conversation[] = await conversationsResponse.json();
        setConversations(conversationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredConversations = conversations.filter((conversation) => {
    const matchesCustomerNumber = conversation.customer_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMessage = conversation.messages.some((message) =>
      (message.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesCustomerNumber || matchesMessage;
  });

  const SkeletonLoader = () => (
    <div className="flex flex-col space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen space-y-2">
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="pt-5  ">
            <Search className="absolute left-7 top-12 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8 border-dotted-gray-100 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];

              return (
                <button
                  key={conversation.id}
                  className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
                  onClick={() => onSelectConversation(conversation.customer_number)}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{conversation.customer_number}</div>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      {lastMessage ? lastMessage.content : 'No messages yet'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ConversationList;
