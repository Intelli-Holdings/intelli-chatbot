// ChatMessages.tsx
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageFormatter } from './MessageFormatter';

interface Message {
  id: number;
  content: string;
  answer: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // ... your existing formatDate logic
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          {message.content && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg max-w-[80%] bg-green-200">
                <MessageFormatter content={message.content} />
                <p className="text-xs mt-1 text-gray-500">
                  {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          )}
          {message.answer && (
            <div className="flex justify-end">
              <div className="p-3 rounded-lg max-w-[80%] bg-blue-500 text-white">
                <MessageFormatter content={message.answer} />
                <p className="text-xs mt-1 text-blue-100">
                  {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
