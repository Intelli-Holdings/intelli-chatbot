import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { toggleAISupport } from '@/app/actions';  // Add this import

interface ConversationHeaderProps {
  onTakeover: (isAIEnabled: boolean) => void;
  senderId: string;
  conversation: Conversation | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onTakeover, senderId, conversation }) => {
  const [isAIEnabled, setIsAIEnabled] = useState(true); // Assuming AI is enabled by default
  const [error, setError] = useState<string | null>(null);

  const handleToggleSupport = async () => {
    try {
      const formData = new FormData();
      formData.append('customerNumber', conversation?.customer_number || conversation?.recipient_id || '');
      formData.append('enableAI', (!isAIEnabled).toString());

      await toggleAISupport(formData);
      setIsAIEnabled(!isAIEnabled);
      onTakeover(!isAIEnabled);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Conversation with {conversation.customer_number || conversation.recipient_id}
        </h2>
        <Button onClick={handleToggleSupport}>
          {isAIEnabled ? 'Takeover Conversation' : 'Handover to AI Assistant'}
        </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ConversationHeader;