// app/components/ConversationList.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: number;
  clientName: string;
  messages: { text: string, timestamp: string }[];
}

const ConversationList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Fetch conversations data from an API or use static data
    const fetchedConversations: Conversation[] = [
      {
        id: 1,
        clientName: 'Alexander',
        messages: [
          { text: 'Hi, there! I would like to ask about my order #1920543.', timestamp: '2024-06-21T11:00:00Z' },
          { text: 'Hi Alexander, we\'re sorry to hear that...', timestamp: '2024-06-21T11:20:00Z' },
          { text: 'Hello, thanks for the speed and expedient action...', timestamp: '2024-06-21T12:00:00Z' },
        ],
      },
      {
        id: 2,
        clientName: 'John Doe',
        messages: [
          { text: 'Can you help me with my order?', timestamp: '2024-06-20T10:00:00Z' },
          { text: 'Sure, I will check that for you.', timestamp: '2024-06-20T10:10:00Z' },
        ],
      },
    ];

    setConversations(fetchedConversations);
  }, []);

  return (
    <div className="flex flex-col p-4 space-y-4">
      {conversations.map((conversation) => (
        <Link href={`/dashboard/conversations/${conversation.id}`} key={conversation.id}>
          <div className="block p-4 border rounded-lg hover:bg-gray-100">
            <div className="flex justify-between">
              <span className="font-medium">{conversation.clientName}</span>
              <span className="text-sm text-gray-500">
                {new Date(conversation.messages[conversation.messages.length - 1].timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {conversation.messages.length} messages
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ConversationList;
