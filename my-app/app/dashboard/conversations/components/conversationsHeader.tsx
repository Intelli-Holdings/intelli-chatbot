// app/dashboard/conversations/components/conversationsHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  onTakeover: () => void;
  senderId: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onTakeover, senderId }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Conversation with {senderId}</h2>
      <Button className="btn-secondary ghost" onClick={onTakeover}>Takeover conversation</Button>
    </div>
  );
};

export default ConversationHeader;