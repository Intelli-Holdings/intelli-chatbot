import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { takeoverConversation, handoverConversation } from '@/app/actions';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from 'date-fns'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ConversationHeaderProps {
  conversation: Conversation | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ conversation }) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isAiSupport, setIsAiSupport] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

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

  useEffect(() => {
    if (conversation && conversation.messages) {
      // Attempt to extract customer name from messages
      for (const message of conversation.messages) {
        const nameMatch = message.content?.match(/customer name : (\w+)/);
        if (nameMatch && nameMatch[1]) {
          setCustomerName(nameMatch[1]);
          break;
        }
      }
    }
  }, [conversation]);

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
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${conversation.customer_name}.png`} />
            <AvatarFallback>{conversation.customer_name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">
              {customerName || conversation.customer_name || conversation.recipient_id}
            </h2>
            <p className="text-xs text-muted-foreground">
              Last active {format(parseISO(conversation.updated_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center ml-2">
          <Button className='border border-blue-200 rounded-xl shadow-md' variant="default" onClick={handleToggleAISupport} size="sm">
            {isAiSupport ? 'Handover to AI' : 'Takeover AI'}
          </Button>     
        </div>
      </div>
      {isAiSupport && (
        <div className="w-full bg-purple-100 text-red-700 p-3 text-center">
          <p>Remember to handover to AI when you&apos;re done sending messages.</p>
        </div>
      )}
      {error && (
        <div className="w-full bg-red-100 text-red-700 p-3 text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;