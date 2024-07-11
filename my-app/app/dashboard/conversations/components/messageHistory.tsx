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
        <div key={index} className="flex flex-col space-y-2">
          {/* User Message Bubble */}
          {message.content && (
            <div className={clsx('max-w-[70%] p-3 rounded-lg bg-blue-100 self-start')}>
              <p dangerouslySetInnerHTML={{ __html: urlify(message.content) }}></p>
              <small className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</small>
            </div>
          )}

          {/* Answer Message Bubble with Tag */}
          {message.answer && (
            <div className={clsx('max-w-[70%] p-3 rounded-lg bg-gray-100 self-end', {
              'bg-gray-100': message.sender === 'ai',
              'bg-green-100': message.sender === 'human'
            })}>
              <p dangerouslySetInnerHTML={{ __html: urlify(message.answer) }}></p>
              <small className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()} - {message.sender === 'ai' ? 'AI' : 'Human'}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageHistory;