import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { takeoverConversation, handoverConversation } from '@/app/actions';
import { useUser } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TakeOverComponentProps {
  conversation: Conversation;
  onTakeOver: () => void;
}

const TakeOverComponent: React.FC<TakeOverComponentProps> = ({ conversation, onTakeOver }) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

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

  const handleTakeOver = async () => {
    if (!conversation || !phoneNumber) return;

    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('customerNumber', conversation.customer_number || conversation.recipient_id);

      const result = await takeoverConversation(formData);
      console.log('Takeover result:', result);

      onTakeOver();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        Conversation with {conversation.customer_number || conversation.recipient_id}
      </h2>
      <Button onClick={handleTakeOver}>
        Takeover Conversation
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default TakeOverComponent;
