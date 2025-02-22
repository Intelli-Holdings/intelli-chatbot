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
  const renderMediaContent = (message: any) => {
    if (!message.media) return null;
    
    const mimeType = message.media.mimeType || 
                     (message.media.type === 'image' ? 'image/jpeg' :
                      message.media.type === 'video' ? 'video/mp4' :
                      message.media.type === 'audio' ? 'audio/mpeg' : 
                      'application/octet-stream');
    
    const isCustomer = message.sender === 'customer';
    const justifyClass = isCustomer ? 'justify-start' : 'justify-end';
    const bgClass = isCustomer ? 'bg-[#dcf8c6]' : 'bg-background';

    switch (message.media.type) {
      case 'image':
        return (
          <div className={`flex ${justifyClass} mb-2`}>
            <div className={`${bgClass} p-2 rounded-lg shadow-sm max-w-[280px] transition-all hover:shadow-md group`}>
              <div className="relative">
                <img
                  src={message.media.url || "/placeholder.svg"}
                  alt={message.media.fileName || "Image attachment"}
                  className="rounded max-w-[280px] max-h-[280px] object-cover cursor-pointer transition-transform hover:brightness-90"
                  onClick={() => openMediaPreview(message.media.url, mimeType, message.media.fileName)}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white shadow-md rounded-full"
                    onClick={() => openMediaPreview(message.media.url, mimeType, message.media.fileName)}
                  >
                    <Maximize className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {message.media.fileName && (
                <p className="text-sm mt-1 truncate max-w-[280px]">{message.media.fileName}</p>
              )}
              <span className="text-xs text-muted-foreground block mt-1">
                {format(parseISO(message.created_at), "h:mm a")}
              </span>
            </div>
          </div>
        );

      case 'document':
      case 'file':
        return (
          <div className={`flex ${justifyClass} mb-2`}>
            <div className={`${bgClass} p-3 rounded-lg shadow-sm max-w-[280px] hover:shadow-md transition-all`}>
              <div className="flex items-start space-x-3">
                <FileIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.media.fileName || "Document"}</p>
                  {message.media.fileSize && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(message.media.fileSize)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(message.created_at), "h:mm a")}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => openMediaPreview(message.media.url, mimeType, message.media.fileName)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => window.open(message.media.url, "_blank")}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className={`${bgClass} p-2 rounded-lg shadow-sm max-w-[80%]`}>
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <p className="text-sm font-medium truncate">{message.media.fileName || "Audio message"}</p>
            </div>
            <audio className="w-full" controls>
              <source src={message.media.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {format(parseISO(message.created_at), "h:mm a")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.open(message.media.url, '_blank')}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className={`${bgClass} p-2 rounded-lg shadow-sm max-w-[80%] group transition-all hover:shadow-md`}>
            <div className="relative">
              <video 
                className="rounded max-w-[280px] cursor-pointer hover:brightness-90" 
                preload="metadata"
                onClick={() => openMediaPreview(message.media.url, mimeType, message.media.fileName)}
              >
                <source src={message.media.url} type={mimeType} />
                Your browser does not support the video element.
              </video>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-10 w-10 bg-black/30 hover:bg-black/50 text-white shadow-md rounded-full"
                  onClick={() => openMediaPreview(message.media.url, mimeType, message.media.fileName)}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {message.media.fileName && (
              <p className="text-sm mt-1 truncate max-w-[280px]">{message.media.fileName}</p>
            )}
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {format(parseISO(message.created_at), "h:mm a")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.open(message.media.url, '_blank')}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${bgClass} p-3 rounded-lg shadow-sm max-w-[80%]`}>
            <div className="flex items-center space-x-2">
              <File className="h-5 w-5 text-gray-500" />
              <p className="text-sm">Received attachment</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => window.open(message.media.url, '_blank')}
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
            <span className="text-xs text-muted-foreground block mt-1">
              {format(parseISO(message.created_at), "h:mm a")}
            </span>
          </div>
        );
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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
    <div className="flex flex-col h-screen mx-auto py-4 border-l">
      <ConversationHeader
        conversation={conversation}
        phoneNumber={phoneNumber}
      />

      <div className="flex justify-between px-1 py-1 bg-white border-b border-gray-100">
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
                <Forward className="mr-2 h-4 w-4" />
                Export Conversation
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
                <div key={message.id} className="flex flex-col mb-4">
                  {/* Customer content */}
                  {message.content && (
                    <>
                      {message.media && (
                        <div className="flex justify-start mb-2">
                          {renderMediaContent(message)}
                        </div>
                      )}
                      <div
                        className={`message-bubble message-customer ${
                          !expandedMessages.includes(message.id) ? "collapsed" : ""
                        }`}
                      >
                        <div className="message-tail message-tail-left" />
                        <div className="text-sm">
                          {formatMessage(message.content)}
                        </div>
                        <span className="text-[10px] text-white/80 mt-1 block">
                          {format(parseISO(message.created_at), "h:mm a")}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Business/AI response */}
                  {message.answer && (
                    <>
                      {message.media && (
                        <div className="flex justify-end mb-2">
                          {renderMediaContent({ ...message, sender: 'business' })}
                        </div>
                      )}
                      <div
                        className={`message-bubble ${
                          message.sender === "ai" ? "message-assistant" : "message-human"
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
                          {formatMessage(message.answer)}
                        </div>
                        <span
                          className={`text-[10px] ${
                            message.sender === "ai" ? "text-black/60" : "text-white/80"
                          } mt-1 block`}
                        >
                          {format(parseISO(message.created_at), "h:mm a")} -{" "}
                          {message.sender === "ai" ? "AI" : "Human"}
                        </span>
                      </div>
                    </>
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