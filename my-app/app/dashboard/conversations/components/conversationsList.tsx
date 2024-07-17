import React, { useState, useEffect } from 'react';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_API_URL = 'https://intelli-python-backend-56zq.onrender.com';

interface Message {
  content: string;
  answer: string;
  created_at: string;
  sender: string;
  chatsession: {
    customer_number: string;
    updated_at: string;
  };
}

interface ConversationListProps {
  onSelectConversation: (customerNumber: string) => void;
  phoneNumber: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, phoneNumber }) => {
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/appservice/conversations/whatsapp/chat_sessions/15556221967/254751578687/`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data: Message[] = await response.json();
        
        const groupedConversations = data.reduce((acc, message) => {
          const customerNumber = message.chatsession.customer_number;
          if (!acc[customerNumber]) {
            acc[customerNumber] = [];
          }
          acc[customerNumber].push(message);
          return acc;
        }, {} as { [key: string]: Message[] });

        setConversations(groupedConversations);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [phoneNumber]);

  const filteredConversations = Object.entries(conversations).filter(([customerNumber]) =>
    customerNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
            filteredConversations.map(([customerNumber, messages]) => (
              <div
                key={customerNumber}
                className="block p-4 border rounded-lg hover:none cursor-pointer"
                onClick={() => onSelectConversation(customerNumber)}
              >
                <div className="flex justify-between">
                  <span className="text-s font-medium">Customer Contact: {customerNumber}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(messages[messages.length - 1].chatsession.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Messages: {messages.length}
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