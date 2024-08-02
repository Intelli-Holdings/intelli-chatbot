import { useState, useEffect, useRef } from 'react';
import ConversationHeader from './conversationsHeader';
import MessageHistory from './messageHistory';
import MessageInput from './messageInput';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import { Conversation } from './types'

interface ConversationViewProps {
  conversation: Conversation | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Select a conversation to view details</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-4 gap-2">
        <ConversationHeader conversation={conversation} />
        <ScrollArea ref={scrollAreaRef} className="scrollArea">
          <MessageHistory messages={conversation.messages} />
          <div ref={dummyRef} />
          <Scrollbar orientation="vertical" className="scrollbar" />
        </ScrollArea>
        <MessageInput 
          customerNumber={conversation.customer_number || conversation.recipient_id}
        />
      </div>
    </TooltipProvider>
  );
}

export default ConversationView;
