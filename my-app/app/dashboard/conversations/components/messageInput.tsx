import React, { useState, useEffect } from 'react';
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendMessage } from '@/app/actions';  
import { useUser } from '@clerk/nextjs';
import {  ArrowUp } from 'lucide-react'
import { Card } from "@/components/ui/card"
import {toast} from 'sonner'
import { Conversation } from '@/app/dashboard/conversations/components/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface MessageInputProps {
  customerNumber: string;
  phoneNumber: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  customerNumber,
  phoneNumber 
}) => {
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const formData = new FormData();
      formData.append('customer_number', customerNumber);
      formData.append('phone_number', phoneNumber || '');
      formData.append('answer', answer);      
      const response = await sendMessage(formData);
      console.log('Message sent successfully:', response);
      toast.success('Message sent successfully');
      setContent('');
      setAnswer('');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Failed to send message');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className=" rounded-lg ">
      <Card className="mx-2 border shadow-sm">
        <div className="flex items-center p-1">
          <Input 
            placeholder="Reply to customer..." 
           
            id="answer"
         
          className="border-0 p-3 m-1 shadow-xs focus-visible:ring-0"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          name="answer"
          />
          <Button type="submit" size="icon" variant='default' className="ml-2">
       
            <ArrowUp className="h-4 w-4" />           
          </Button>
        </div>
      </Card>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default MessageInput;
