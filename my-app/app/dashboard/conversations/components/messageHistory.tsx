import React from 'react'; 
import clsx from 'clsx'; 
import "./style.css"

interface ChatMessage { 
  role: string; 
  content: string; 
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
        <div 
          key={index} 
          className={clsx( 
            'flex', 
            message.role === 'user' ? 'justify-start' : 'justify-end' 
          )} 
        > 
          <div 
            className={clsx( 
              'max-w-xs px-4 py-2 text-md text-gray-700 rounded-lg shadow-sm break-words', 
              message.role === 'user' ? 'bg-green-100' : 'bg-gray-100' 
            )} 
          > 
            <p className="font-bold">{message.role === 'user' ? 'User' : 'Assistant'}</p> 
            <p 
              className="msg-content" 
              dangerouslySetInnerHTML={{ __html: urlify(message.content) }} 
            ></p> 
          </div> 
        </div> 
      ))} 
    </div> 
  ); 
}; 

export default MessageHistory;
