import { useState, useEffect } from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: { role: string; content: string }[];
  created_at: string;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('https://intelli-python-backend-zwyu.onrender.com/dashboard/conversations/whatsapp/');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ScrollArea className="flex flex-col p-4 space-y-4 overflow-y-auto">
      <div className="flex w-full flex-col gap-1">                
      {conversations.map((conversation) => (
        <ScrollArea
          key={conversation.id}
          className="block p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex justify-between">
            <span className="font-medium">Customer Contact: {conversation.recipient_id}</span>
            <span className="text-sm text-gray-500">
              {new Date(conversation.created_at).toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {conversation.chat_history.length} messages
          </div>
          
        </ScrollArea>
      ))}
     
    
      </div>
    </ScrollArea>
  );
}

export default ConversationList;