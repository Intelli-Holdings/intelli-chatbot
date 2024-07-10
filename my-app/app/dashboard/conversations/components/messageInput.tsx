// app/components/MessageInput.tsx
import React, { useState } from 'react';
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendMessage } from '@/app/actions';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await sendMessage(new FormData(event.target as HTMLFormElement));
      console.log('Message sent successfully:', response);
      setMessage('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
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
      <div className="flex items-center p-2 pt-0">
        <Button type="submit" size="sm" className="ml-auto gap-1.5">
          Send Message
          <CornerDownLeft className="size-3.5" />
        </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default MessageInput;