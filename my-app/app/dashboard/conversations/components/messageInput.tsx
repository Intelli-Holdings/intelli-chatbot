import React, { useState } from 'react';
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendMessage } from '@/app/actions';  

interface MessageInputProps {
  phoneNumber: string;
  customerNumber: string;

}

const MessageInput: React.FC<MessageInputProps> = ({ phoneNumber, customerNumber }) => {
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const formData = new FormData();
      formData.append('customer_number', customerNumber);
      formData.append('phone_number', phoneNumber);
      formData.append('content', content);
      formData.append('answer', answer);
      
      const response = await sendMessage(formData);
      console.log('Message sent successfully:', response);
      setContent('');
      setAnswer('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
        <Label htmlFor="content" className="sr-only">
          Message Content
        </Label>
        <Input
          id="content"
          placeholder="Input the message content..."
          className="border-0 p-3 shadow-xs focus-visible:ring-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          name="content"
        />
        <Input
          id="answer"
          placeholder="Answer from human support..."
          className="border-0 p-3 mt-2 shadow-xs focus-visible:ring-0"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          name="answer"
        />
        <div className="flex items-center p-2 pt-0">
          <Button type="submit" size="sm" className="ml-auto gap-1.5">
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
      
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default MessageInput;