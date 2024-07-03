import { useState, useEffect } from 'react';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface Conversation {
  id: number;
  sender_id: string;
  recipient_id: string;
  chat_history: { role: string; content: string; timestamp: string }[];
  created_at: string;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
        // Sort conversations by the timestamp of the most recent message
        const sortedConversations = data.sort((a: Conversation, b: Conversation) => {
          const lastMessageA = a.chat_history[a.chat_history.length - 1];
          const lastMessageB = b.chat_history[b.chat_history.length - 1];
          return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
        });
        setConversations(sortedConversations);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.recipient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.chat_history.some(message =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>
      <ScrollArea className="flex flex-col p-4 space-y-4 overflow-y-auto">
        <div className="flex w-full flex-col gap-1">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="block p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex justify-between">
                <span className="text-s font-medium">Customer Contact: {conversation.recipient_id}</span>
                <span className="text-sm text-gray-500">
                  {new Date(conversation.created_at).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {conversation.chat_history.length} messages
              </div>
            </div>
          ))}
        </div>
        <Scrollbar orientation="vertical" />
      </ScrollArea>
    </>
  );
}

export default ConversationList;
