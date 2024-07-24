import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { toggleAISupport } from '@/app/actions';  

interface ConversationHeaderProps {
  conversation: Conversation | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ conversation }) => {
  const [error, setError] = useState<string | null>(null);

  const handleTakeover = async () => {
    if (!conversation) return;

    try {
      const formData = new FormData();
      formData.append('phoneNumber', conversation.phone_number);
      formData.append('customerNumber', conversation.customer_number || conversation.recipient_id);

      const result = await toggleAISupport(formData);
      console.log('Takeover result:', result);
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
        <Button onClick={handleTakeover}>
          Takeover Conversation
        </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ConversationHeader;