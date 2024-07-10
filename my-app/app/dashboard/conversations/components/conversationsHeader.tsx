import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';

interface ConversationHeaderProps {
  onTakeover: (isTakeover: boolean) => void;
  senderId: string;
  conversation: Conversation | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onTakeover, senderId, conversation }) => {
  const [isTakeover, setIsTakeover] = useState(false);

  const handleTakeover = () => {
    setIsTakeover(!isTakeover);
    onTakeover(!isTakeover);
  };

  if (!conversation) return null;

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        Conversation with {conversation.customer_number || conversation.recipient_id}
      </h2>
      <Button onClick={handleTakeover}>
        {isTakeover ? 'Handover to AI Assistant' : 'Takeover Conversation'}
      </Button>
    </div>
  );
};

export default ConversationHeader;