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
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleTakeover = (aiEnabled: boolean) => {
    setIsAIEnabled(aiEnabled);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
        <ConversationHeader 
          onTakeover={handleTakeover} 
          senderId={conversation.phone_number} 
          conversation={conversation}
        />
        <ScrollArea ref={scrollAreaRef} className="flex-grow max-h-[70vh] overflow-y-auto">
          <MessageHistory messages={conversation.messages} />
          <Scrollbar orientation="vertical" />
        </ScrollArea>
        <MessageInput 
          isAIEnabled={isAIEnabled}
          phoneNumber={conversation.phone_number}
          customerNumber={conversation.customer_number}
          onToggleSupport={() => setIsAIEnabled(!isAIEnabled)}
        />
      </div>
    </TooltipProvider>
  );
}

export default ConversationView;
