import React from 'react';
import clsx from 'clsx'; 
import "./style.css"

interface ChatMessage {
  content: string | null;
  answer: string;
  created_at: string;
  sender: string | null;
  chatsession: {
    customer_number: string;
    updated_at: string;
  };
}

interface MessageHistoryProps {
  messages: ChatMessage[];
}

// Function to convert URLs in the text to clickable links
const urlify = (text: string) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600">${url}</a>`);
};

const MessageHistory: React.FC<MessageHistoryProps> = ({ messages }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg max-h-[70vh] overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p dangerouslySetInnerHTML={{ __html: urlify(message.content || '') }}></p>
            <small className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageHistory;