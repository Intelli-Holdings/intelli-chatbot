import { useState } from 'react';
import ConversationHeader from './conversationsHeader';
import MessageHistory from './messageHistory';
import MessageInput from './messageInput';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: { role: string; content: string }[];
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
      <div className="flex flex-col h-full">
        <ConversationHeader onTakeover={handleTakeover} senderId={conversation.recipient_id} />
        <ScrollArea className="flex-grow">
          <div className="flex flex-col gap-2 p-4">
            <MessageHistory messages={conversation.chat_history} />
          </div>
        </ScrollArea>
        {isTakeover && <MessageInput />}
      </div>
    </TooltipProvider>
  );
}

export default ConversationView;