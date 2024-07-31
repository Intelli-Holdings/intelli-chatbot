import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { takeoverConversation, handoverConversation } from '@/app/actions';
import { useUser } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ConversationHeaderProps {
  conversation: Conversation | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ conversation }) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isAiSupport, setIsAiSupport] = useState<boolean>(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      const userEmail = user.primaryEmailAddress.emailAddress;

      const fetchPhoneNumber = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
          const data = await response.json();

          if (data.length > 0 && data[0].phone_number) {
            setPhoneNumber(data[0].phone_number);
          } else {
            throw new Error('Phone number not found in the response.');
          }
        } catch (e) {
          setError((e as Error).message);
        }
      };

      fetchPhoneNumber();
    }
  }, [user, conversation]);

  const handleToggleAISupport = async () => {
    if (!conversation || !phoneNumber) return;

    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('customerNumber', conversation.customer_number || conversation.recipient_id);

      if (isAiSupport) {
        const result = await handoverConversation(formData);
        console.log('Handover result:', result);
      } else {
        const result = await takeoverConversation(formData);
        console.log('Takeover result:', result);
      }

      setIsAiSupport(!isAiSupport);
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
        <Button onClick={handleToggleAISupport}>
          {isAiSupport ? 'Handover to AI' : 'Takeover Conversation'}
        </Button>
      </div>
      {isAiSupport && (
        <div className="bg-purple-100 text-red-700 p-3 rounded-lg">
          <p>Remember to handover to AI when you&apos;re done sending messages.</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ConversationHeader;
