'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from './types';
import { takeoverConversation, handoverConversation } from '@/app/actions';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from 'date-fns';
import { ChevronDown, Phone, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useCall } from '@/hooks/use-call';
import { CallUI } from '@/components/call-ui';

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
  const { callState, initiateCall, answerCall, endCall } = useCall();

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

  const handleCallInitiate = (type: 'audio' | 'video') => {
    initiateCall({
      type,
      recipientId: conversation?.customer_number || conversation?.recipient_id || '',
      recipientName: conversation?.customer_name || 'Unknown',
    });
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between p-2 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2 -ml-2 hover:bg-gray-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${conversation.customer_name || conversation.customer_number}.png`} />
                <AvatarFallback>{(conversation.customer_name || conversation.phone_number).slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {conversation.customer_name || conversation.recipient_id}
                  </h2>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Select for contact info
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-0">
            <Card className="border-0">
              <CardContent className="p-0">
                <div className="flex flex-col items-center pt-8 pb-6 bg-gray-50">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={`https://avatar.vercel.sh/${conversation.customer_name || conversation.customer_number}.png`} />
                    <AvatarFallback>{(conversation.customer_name || conversation.phone_number).slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-1">
                    {conversation.customer_name || conversation.recipient_id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last active {format(parseISO(conversation.updated_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="p-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Phone number</label>
                      <p className="text-sm font-medium">+{conversation.customer_number || conversation.recipient_id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          
          <Button 
            className='border border-blue-200 rounded-xl shadow-md ml-2' 
            variant="default" 
            onClick={handleToggleAISupport} 
            size="sm"
          >
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
      <CallUI 
        callState={callState}
        onAnswer={answerCall}
        onEnd={endCall}
      />
    </div>
  );
};

export default ConversationHeader;

