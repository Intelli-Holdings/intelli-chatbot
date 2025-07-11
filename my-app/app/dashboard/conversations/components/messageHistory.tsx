import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import './style.css';
import { ChatMessage } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageHistoryProps {
  messages: ChatMessage[];
}

// Function to convert URLs in the text to clickable links
const urlify = (text: string | null): string => {
  if (typeof text !== 'string') return '';
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600">${url}</a>`);
};

// Function to format the date headers
const formatDateHeader = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d');
};

// Function to group messages by date
const groupMessagesByDate = (messages: ChatMessage[]): Record<string, ChatMessage[]> => {
  return messages.reduce((groups, message) => {
    const date = format(parseISO(message.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);
};

const MessageHistory: React.FC<MessageHistoryProps> = ({ messages }) => {
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupedMessages = groupMessagesByDate(messages);
  const dates = Object.keys(groupedMessages);

  return (
    <ScrollArea className="space-y-4 p-4 bg-gray-50 rounded-lg max-h-[70vh] overflow-y-auto">
      {dates.map((date) => (
        <div key={date} className="mb-4">
          {/* Date Header */}
          <div className="text-center text-gray-500 text-sm py-2 mb-2">
            {formatDateHeader(parseISO(date))}
          </div>
          {/* Messages for this date */}
          <div className="space-y-4">
            {groupedMessages[date].map((message: ChatMessage) => (
              <div key={message.id} className="flex flex-col space-y-2">
                {/* User Message Bubble */}
                {message.content && (
                  <div className={clsx('max-w-[70%] px-4 py-3 rounded-lg bg-blue-100 self-start')}>
                    <p className="mb-2" dangerouslySetInnerHTML={{ __html: urlify(message.content) }}></p>
                    <small className="text-xs text-gray-500">{format(parseISO(message.created_at), 'h:mm a')}</small>
                  </div>
                )}
                {/* Answer Message Bubble with Tag */}
                {message.answer && (
                  <div
                    className={clsx('max-w-[70%] px-4 py-3 rounded-lg self-end', {
                      'bg-gray-100': message.sender === 'ai',
                      'bg-green-100': message.sender === 'human'
                    })}
                  >
                    <p className="mb-2" dangerouslySetInnerHTML={{ __html: urlify(message.answer) }}></p>
                    <small className="text-xs text-gray-500">
                      {format(parseISO(message.created_at), 'h:mm a')} - {message.sender === 'ai' ? 'AI' : 'Human'}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={dummy} />
    </ScrollArea>
  );
};

export default MessageHistory;