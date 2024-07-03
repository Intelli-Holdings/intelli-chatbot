import { useState } from 'react';
import ConversationHeader from './conversationsHeader';
import MessageHistory from './messageHistory';
import MessageInput from './messageInput';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: { role: string; content: string; timestamp: string }[];
  created_at: string;
}

interface ConversationViewProps {
  conversation: Conversation | null;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation }) => {
  const [isTakeover, setIsTakeover] = useState(false);

  const handleTakeover = () => {
    setIsTakeover(true);
  };

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
        <ConversationHeader onTakeover={handleTakeover} senderId={conversation.recipient_id} />
        <ScrollArea className="flex-grow max-h-[70vh] overflow-y-auto">
          <MessageHistory messages={conversation.chat_history} />
          <Scrollbar orientation="vertical" />
        </ScrollArea>
        {isTakeover && <MessageInput />}
      </div>
    </TooltipProvider>
  );
}

export default ConversationView;
