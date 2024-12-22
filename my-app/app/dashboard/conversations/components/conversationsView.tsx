'use client'

import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp } from 'lucide-react'
import { Conversation } from './types'
import { format, parseISO } from 'date-fns'
import ConversationHeader from './conversationsHeader'
import MessageInput from './messageInput'
import { formatMessage } from '@/utils/formatMessage'
import './message-bubble.css'

interface ConversationViewProps {
  conversation: Conversation | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation }) => {
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 border-gray-100">
        <p className="text-muted-foreground">Select a conversation to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 mx-auto py-4">
      {/* Header */}
      <ConversationHeader conversation={conversation} />
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {conversation.messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              {message.content && (
                <div className="message-bubble message-customer">
                  <div className="message-tail message-tail-left" />
                  <div className="text-sm">
                    {formatMessage(message.content)}
                  </div>
                  <span className="text-[10px] text-white/80 mt-1 block">
                    {format(parseISO(message.created_at), 'h:mm a')}
                  </span>
                </div>
              )}
              {message.answer && (
                <div className={`message-bubble ${message.sender === 'ai' ? 'message-assistant' : 'message-human'}`}>
                  <div className={`message-tail ${message.sender === 'ai' ? 'message-tail-right-assistant' : 'message-tail-right-human'}`} />
                  <div className="text-sm">
                    {formatMessage(message.answer)}
                  </div>
                  <span className={`text-[10px] ${message.sender === 'ai' ? 'text-black/60' : 'text-white/80'} mt-1 block`}>
                    {format(parseISO(message.created_at), 'h:mm a')} - {message.sender === 'ai' ? 'AI' : 'Human'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>     
      
      {/* Input Area */}
      <MessageInput customerNumber={conversation.customer_number || conversation.recipient_id} />
    </div>
  );
}

export default ConversationView;

