// MessageInput.tsx
import React, { useState } from 'react';
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendMessage, toggleAISupport } from '@/app/actions';  

interface MessageInputProps {
  isAIEnabled: boolean;
  customerNumber: string;
  customerName: string;
  onToggleSupport: () => void;
}

interface ConversationData {
  customerNumber: string;
  customerName: string;
  answer?: string; 
  enableAI?: string; 
}

const MessageInput: React.FC<MessageInputProps> = ({ isAIEnabled, customerNumber, customerName, onToggleSupport }) => {
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      formData.append('customerNumber', customerNumber);
      formData.append('customerName', customerName);
      formData.append('answer', answer);
      
      const response = await sendMessage(formData);
      console.log('Message sent successfully:', response);
      setMessage('');
      setAnswer('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleToggleSupport = async () => {
    try {
      // Create a FormData object from the ConversationData object
      const formData = new FormData();
      formData.append('customerNumber', customerNumber);
      formData.append('enableAI', (!isAIEnabled).toString());

      await toggleAISupport(formData);
      onToggleSupport();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Input
          id="message"
          placeholder="Reply to the messages here..."
          className="border-0 p-3 shadow-xs focus-visible:ring-0"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          name="message"
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