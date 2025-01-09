import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { takeoverConversation, handoverConversation } from '@/app/actions';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ConversationHeaderProps {
  conversation: Conversation | null;
  phoneNumber: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  conversation,
  phoneNumber 
}) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const [isAiSupport, setIsAiSupport] = useState<boolean>(false);

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
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${conversation.customer_name || conversation.customer_number}.png`} />
            <AvatarFallback>{(conversation.customer_name || conversation.phone_number).slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">{conversation.customer_name || conversation.recipient_id}</h2>
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
