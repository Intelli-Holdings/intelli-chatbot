'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { Conversation } from './types';

// Utility function to format numbers with k, M suffix
const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${Math.floor(num / 1000)}k`;
  return `${Math.floor(num / 1000000)}M`;
};

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ conversations = [], onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filtered = conversations.filter((conversation) => {
      const searchString = searchTerm.toLowerCase();
      const name = (conversation.customer_name || conversation.customer_number).toLowerCase();
      const lastMessage = conversation.messages[conversation.messages.length - 1]?.content?.toLowerCase() || '';
      
      return name.includes(searchString) || lastMessage.includes(searchString);
    });
    
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="pt-5">
            <Search className="absolute left-7 top-12 h-4 w-4 text-muted-foreground" />
            <Input
              disabled
              placeholder="Search"
              className="pl-9 bg-secondary/50"
            />
          </div>
        </div>
        <div className="flex-1 p-4">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (!filteredConversations.length) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="pt-5">
            <Search className="absolute left-7 top-12 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8 border-dotted-gray-100 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 text-center text-muted-foreground">Fetching conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen space-y-2">
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="pt-5">
          <Search className="absolute left-7 top-12 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 border-dotted-gray-100 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          {filteredConversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1]?.content || 'No messages yet';
            const unreadCount = conversation.messages.filter(m => !m.read).length;
            
            return (
              <button
                key={conversation.id}
                className="flex flex-col items-start gap-2 rounded-lg shadow-md border p-3 text-left text-sm transition-all hover:bg-accent"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold truncate max-w-[80%]">
                      {conversation.customer_name || conversation.customer_number}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {format(parseISO(conversation.updated_at), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate max-w-[80%]">
                      {lastMessage}
                    </span>
                    {unreadCount > 0 && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 h-5 min-w-[24px] p-2 rounded-full flex items-center justify-center bg-blue-500 text-white"
                      >
                        {formatNumber(unreadCount)}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="flex flex-col space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex p-4 border rounded-lg items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[40px]" />
          </div>
          <Skeleton className="h-3 w-[80%]" />
        </div>
      </div>
    ))}
  </div>
);

export default ConversationsList;