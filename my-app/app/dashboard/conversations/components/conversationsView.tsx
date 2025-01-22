"use client";

import React, { useState, useRef, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Conversation } from './types'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import ConversationHeader from './conversationsHeader'
import MessageInput from './messageInput'
import { formatMessage } from '@/utils/formatMessage'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Share } from 'lucide-react'
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from '@/utils/exportUtils'
import './message-bubble.css'

interface ConversationViewProps {
  conversation: Conversation | null;
  conversations: Conversation[];
  phoneNumber: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  conversations,
  phoneNumber,
}) => {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const toggleMessage = (messageId: number) => {
    setExpandedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, shouldAutoScroll]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    // Implement delete logic here
    console.log(`Delete message ${messageId}`);
  };

  const handleEditMessage = (messageId: number) => {
    // Implement edit logic here
    console.log(`Edit message ${messageId}`);
  };

  const handleCopyMessage = (messageId: number) => {
    // Implement copy logic here
    console.log(`Copy message ${messageId}`);
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 ">
        <p className="text-muted-foreground">
          Select a conversation to view messages.
        </p>
      </div>
    );
  }

  const groupMessagesByDate = (messages: Conversation["messages"]) => {
    const groups: { [key: string]: Conversation["messages"] } = {};
    messages.forEach((message) => {
      const date = format(parseISO(message.created_at), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const renderDateSeparator = (date: string) => {
    const messageDate = parseISO(date);
    let dateString;
    if (isToday(messageDate)) {
      dateString = "Today";
    } else if (isYesterday(messageDate)) {
      dateString = "Yesterday";
    } else {
      dateString = format(messageDate, "MMMM d, yyyy");
    }
    return (
      <div className="flex justify-center my-4">
        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
          {dateString}
        </span>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(conversation.messages);

  const handleExport = (format: 'pdf' | 'csv') => {
    switch (format) {
      case "pdf":
        exportToPDF(conversation);
        break;
      case "csv":
        exportToCSV(conversation);
        break;
    }
  };

  const handleExportContacts = (format: 'pdf' | 'csv') => {
    switch (format) {
      case 'pdf':
        exportContactsToPDF(conversations);
        break;
      case 'csv':
        exportContactsToCSV(conversations);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen mx-auto py-4 border-l">
      <ConversationHeader
        conversation={conversation}
        phoneNumber={phoneNumber}
      />

      <div className="flex justify-end space-x-1 px-1 py-1 bg-white border-b border-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share Conversation
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleExport('pdf')}>Share as PDF</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport('csv')}>Share as CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export Contacts
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => handleExportContacts('pdf')}>
      Export as PDF
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleExportContacts('csv')}>
      Export as CSV
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      </div>

      <ScrollArea
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div className="" key={date}>
              {renderDateSeparator(date)}
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  {message.content && (
                    <div
                      className={`message-bubble message-customer ${
                        !expandedMessages.includes(message.id)
                          ? "collapsed"
                          : ""
                      }`}
                    >
                      <div className="message-tail message-tail-left" />
                      <div className="text-sm">
                        {formatMessage(
                          message.content
                        )}
                      </div>
                      <span className="text-[10px] text-white/80 mt-1 block">
                        {format(parseISO(message.created_at), "h:mm a")}
                      </span>
                    </div>
                  )}

                  {message.answer && (
                    <div
                      className={`message-bubble ${
                        message.sender === "ai"
                          ? "message-assistant"
                          : "message-human"
                      }`}
                    >
                      <div
                        className={`message-tail ${
                          message.sender === "ai"
                            ? "message-tail-right-assistant"
                            : "message-tail-right-human"
                        }`}
                      />
                      <div className="text-sm">
                        {formatMessage(
                          message.answer
                        )}
                      </div>
                      <span
                        className={`text-[10px] ${
                          message.sender === "ai"
                            ? "text-black/60"
                            : "text-white/80"
                        } mt-1 block`}
                      >
                        {format(parseISO(message.created_at), "h:mm a")} -{" "}
                        {message.sender === "ai" ? "AI" : "Human"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div ref={dummyRef} />
      </ScrollArea>

      <MessageInput
        customerNumber={
          conversation.customer_number || conversation.recipient_id
        }
        phoneNumber={phoneNumber}
      />
    </div>
  );
};

export default ConversationView;