"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Conversation, MediaType } from './types' 
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import ConversationHeader from './conversationsHeader'
import MessageInput from './messageInput'
import { formatMessage } from '@/utils/formatMessage'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Download, Share, FileDown, FolderDown, Forward, 
  File, Image, Music, Video, RefreshCw, 
  FileText, X, Eye, ExternalLink, Maximize, FileIcon
} from 'lucide-react'
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from '@/utils/exportUtils'
import './message-bubble.css'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ImagePreview } from "@/app/dashboard/conversations/components/image-preview"

// Extended interface to include polling configuration
interface ConversationViewProps {
  conversation: Conversation | null;
  conversations: Conversation[];
  phoneNumber: string;
  pollingInterval?: number; // Time in ms between polls (default: 3000ms)
  fetchMessages?: (conversationId: string) => Promise<Conversation["messages"]>;
}

// Helper types for media previews
interface MediaPreviewState {
  isOpen: boolean;
  url: string;
  type: string;
  filename?: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  conversations,
  phoneNumber,
  pollingInterval = 3000,
  fetchMessages, // Function to fetch latest messages from your API
}) => {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Conversation["messages"]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreviewState>({ 
    isOpen: false, 
    url: '', 
    type: '' 
  });

  // Set initial messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setCurrentMessages(conversation.messages);
      setLastMessageId(
        conversation.messages.length > 0
          ? Math.max(...conversation.messages.map(msg => msg.id))
          : null
      );
    }
  }, [conversation]);

  const toggleMessage = (messageId: number) => {
    setExpandedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, shouldAutoScroll]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100; // Adding buffer
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  // Function to fetch and merge new messages
  const refreshMessages = useCallback(async () => {
    if (!conversation || !fetchMessages) return;
    
    try {
      const newMessages = await fetchMessages(conversation.id.toString());
      
      if (newMessages && newMessages.length > 0) {
        // Find the highest message ID from the new messages
        const highestNewId = Math.max(...newMessages.map(msg => msg.id));
        
        // If we have new messages
        if (lastMessageId === null || highestNewId > lastMessageId) {
          // Get only the new messages
          const actualNewMessages = newMessages.filter(msg => lastMessageId === null || msg.id > lastMessageId);
          
          if (actualNewMessages.length > 0) {
            // Update our messages and last message ID
            setCurrentMessages(prev => [...prev, ...actualNewMessages]);
            setLastMessageId(highestNewId);
            
            // Play notification sound for new messages
            if (lastMessageId !== null) {
              playNotificationSound();
            }
          }
        }
      }
      
      if (isManualRefreshing) {
        setIsManualRefreshing(false);
      }
    } catch (error) {
      console.error("Error fetching new messages:", error);
      if (isManualRefreshing) {
        setIsManualRefreshing(false);
      }
    }
  }, [conversation, fetchMessages, lastMessageId, isManualRefreshing]);

  // Setup polling
  useEffect(() => {
    const startPolling = () => {
      if (isPolling && conversation) {
        refreshMessages();
        pollingTimeoutRef.current = setTimeout(startPolling, pollingInterval);
      }
    };

    // Clear any existing polling
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    // Start new polling if enabled
    if (isPolling && conversation) {
      startPolling();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [isPolling, conversation, refreshMessages, pollingInterval]);

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    refreshMessages();
  };

  // Toggle polling on/off
  const togglePolling = () => {
    setIsPolling(prev => !prev);
  };

  // Open media preview
  const openMediaPreview = (url: string, type: string, filename?: string) => {
    setMediaPreview({
      isOpen: true,
      url,
      type,
      filename
    });
  };

  // Close media preview
  const closeMediaPreview = () => {
    setMediaPreview({
      ...mediaPreview,
      isOpen: false
    });
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

  // Get icon based on file type
  const getFileIcon = (mimeType: string = '') => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Function to render media preview dialog
  const renderMediaPreviewDialog = () => {
    return (
      <Dialog open={mediaPreview.isOpen} onOpenChange={(open) => !open && closeMediaPreview()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <div className="flex justify-between items-center p-2 bg-black/80 text-white">
            <h3 className="text-sm font-medium truncate max-w-[80%]">
              {mediaPreview.filename || "Media Preview"}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => window.open(mediaPreview.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={closeMediaPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 max-h-[80vh] overflow-auto">
            {mediaPreview.type.startsWith('image/') && (
              <img 
                src={mediaPreview.url} 
                alt={mediaPreview.filename || "Preview"} 
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            {mediaPreview.type.startsWith('video/') && (
              <video
                controls
                className="max-w-full max-h-[70vh]"
                autoPlay
              >
                <source src={mediaPreview.url} type={mediaPreview.type} />
                Your browser does not support the video tag.
              </video>
            )}
            {mediaPreview.type.startsWith('audio/') && (
              <div className="w-full p-8 bg-gray-100 rounded-lg">
                <audio controls className="w-full">
                  <source src={mediaPreview.url} type={mediaPreview.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {(mediaPreview.type.includes('pdf') || !mediaPreview.type.startsWith('image/') && 
               !mediaPreview.type.startsWith('video/') && !mediaPreview.type.startsWith('audio/')) && (
              <div className="bg-white p-8 rounded-lg text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium mb-4">
                  {mediaPreview.filename || "Document preview not available"}
                </p>
                <Button
                  onClick={() => window.open(mediaPreview.url, '_blank')}
                  className="mx-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Function to render media content based on media type
  const renderMediaContent = (message: Conversation["messages"][0]) => {
    if (!message.media) return null;
  
    // Check if media is an image
    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(message.media);
  
    return (
      <div className="max-w-xs rounded-lg overflow-hidden shadow">
        {isImage ? (
          <img
            src={message.media}
            alt="Uploaded content"
            className="w-full h-auto rounded-lg"
          />
        ) : (
          <a
            href={message.media}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View file
          </a>
        )}
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(currentMessages);

  const handleExport = (format: 'pdf' | 'csv') => {
    switch (format) {
      case "pdf":
        exportToPDF({...conversation, messages: currentMessages});
        break;
      case "csv":
        exportToCSV({...conversation, messages: currentMessages});
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
    <div className="flex flex-col h-screen mx-auto py-4 rounded-lg border-l border-r ">
      <ConversationHeader
        conversation={conversation}
        phoneNumber={phoneNumber}
      />

      <div className="flex justify-between px-1 py-1 bg-white border-gray-100">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            {isManualRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePolling}
            className={`ml-2 ${isPolling ? 'text-green-600' : 'text-gray-500'}`}
          >
            {isPolling ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
        </div>
        
        <div className="flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Export Conversation options */}
              <DropdownMenuItem className="font-medium" disabled>
                Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              
              {/* Separator */}
              <div className="h-px bg-muted my-1" />
              
              {/* Export Contacts options */}
              <DropdownMenuItem className="font-medium" disabled>
                Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts('pdf')}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts('csv')}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea
        className="flex-1 p-4 bg-gray-50"
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div className="" key={date}>
              {renderDateSeparator(date)}
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col mb-4">                  
                  {/* Regular text content */}
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

                  {/* AI or human response */}
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
        
        {currentMessages.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        )}
        <div className="h-4" ref={dummyRef} />
      </ScrollArea>

      {/* Media preview dialog */}
      {renderMediaPreviewDialog()}

      <MessageInput
        customerNumber={
          conversation.customer_number || conversation.recipient_id
        }
        phoneNumber={phoneNumber}
        onMessageSent={refreshMessages}
      />
    </div>
  );
};

export default ConversationView;