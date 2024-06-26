// app/components/ConversationView.tsx
import { useState } from 'react';
import ConversationHeader from './conversationsHeader';
import MessageHistory from './messageHistory';
import MessageInput from './messageInput';
import { TooltipProvider } from "@/components/ui/tooltip";

const ConversationView = () => {
  const [isTakeover, setIsTakeover] = useState(false);

  const handleTakeover = () => {
    setIsTakeover(true);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col p-4 h-full">
        <ConversationHeader onTakeover={handleTakeover} />
        <div className="flex-grow overflow-y-auto">
          <MessageHistory />
        </div>
        {isTakeover && <MessageInput />}
      </div>
    </TooltipProvider>
  );
}

export default ConversationView;
