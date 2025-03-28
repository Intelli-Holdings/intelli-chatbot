"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageInput from "./messageInput";
import { formatMessage } from "@/utils/formatMessage";
import type { Conversation } from "./types";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import ConversationHeader from "./conversationsHeader";
import { ScrollToBottomButton } from "@/app/dashboard/conversations/components/scroll-to-bottom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Download,
  FolderDown,
  File,
  Image,
  Music,
  Video,
  RefreshCw,
  FileText,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  exportToPDF,
  exportToCSV,
  exportContactsToPDF,
  exportContactsToCSV,
} from "@/utils/exportUtils";
import "./message-bubble.css";
import ResolveReminder from "@/components/resolve-reminder";

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

interface ChatAreaProps {
  chatId: string;
}

export default function ChatArea({
  conversation,
  conversations,
  phoneNumber,
  pollingInterval = 3000,
  fetchMessages,
}: ConversationViewProps) {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const dummyRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<
    Conversation["messages"]
  >([]);
  const [isPolling, setIsPolling] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreviewState>({
    isOpen: false,
    url: "",
    type: "",
  });
  const [isReminderExpanded, setIsReminderExpanded] = useState(true);

  // Check if the notification sound file exists
  useEffect(() => {
    // Check if the notification sound file exists
    fetch("/notification-pop.mp3", { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          console.error("Notification sound file not found or inaccessible");
        } else {
          console.log("Notification sound file is accessible");
        }
      })
      .catch((error) => {
        console.error("Error checking notification sound file:", error);
      });
  }, []);

  // Add this near the top of your component function
  useEffect(() => {
    // Preload the audio file
    const preloadAudio = () => {
      const audio = new Audio("/notification-pop.mp3");
      audio.preload = "auto";
      document.body.appendChild(audio);

      // Remove it after loading
      audio.addEventListener(
        "canplaythrough",
        () => {
          document.body.removeChild(audio);
        },
        { once: true }
      );
    };

    preloadAudio();

    // Add a one-time event listener for user interaction
    const handleUserInteraction = () => {
      // Create and play a silent audio to unlock audio playback
      const silentAudio = new Audio("/notification-sound.mp3");
      silentAudio.volume = 0.01;
      silentAudio
        .play()
        .catch((e) => console.log("Silent audio initialization:", e));

      // Remove the event listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  // Set initial messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setCurrentMessages(conversation.messages);
      setLastMessageId(
        conversation.messages.length > 0
          ? Math.max(...conversation.messages.map((msg) => msg.id))
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
        const highestNewId = Math.max(...newMessages.map((msg) => msg.id));

        // If we have new messages
        if (lastMessageId === null || highestNewId > lastMessageId) {
          // Get only the new messages
          const actualNewMessages = newMessages.filter(
            (msg) => lastMessageId === null || msg.id > lastMessageId
          );

          if (actualNewMessages.length > 0) {
            // Update our messages and last message ID
            setCurrentMessages((prev) => [...prev, ...actualNewMessages]);
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
      const audio = new Audio("/notification-sound.mp3");

      // Add event listeners to debug issues
      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
      });

      // Modern browsers require user interaction before playing audio
      const playPromise = audio.play();

      // Handle the promise to catch any errors
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Notification sound played successfully");
          })
          .catch((error) => {
            console.error("Error playing notification sound:", error.message);
            // If the error is about user interaction, we can't do much in the background
            if (error.name === "NotAllowedError") {
              console.warn(
                "Browser blocked audio playback without user interaction"
              );
            }
          });
      }
    } catch (error) {
      console.error("Error creating audio element:", error);
    }
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
  const getFileIcon = (mimeType = "") => {
    if (mimeType.startsWith("image/"))
      return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <Video className="h-5 w-5 text-purple-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-5 w-5 text-green-500" />;
    if (mimeType.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return <FileText className="h-5 w-5 text-green-600" />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FileText className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const groupedMessages = groupMessagesByDate(currentMessages);

  const handleExport = (format: "pdf" | "csv") => {
    switch (format) {
      case "pdf":
        exportToPDF({ ...conversation, messages: currentMessages });
        break;
      case "csv":
        exportToCSV({ ...conversation, messages: currentMessages });
        break;
    }
  };

  const handleExportContacts = (format: "pdf" | "csv") => {
    switch (format) {
      case "pdf":
        exportContactsToPDF(conversations);
        break;
      case "csv":
        exportContactsToCSV(conversations);
        break;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header 
      <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={chatData.avatar} alt={chatData.name} />
            <AvatarFallback>{chatData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium">{chatData.name}</h2>
            {chatData.status && <p className="text-xs text-gray-500">{chatData.status}</p>}
          </div>
        </div>
      */}
      <div className="flex items-center justify-between p-3 bg-white border-l border-gray-200">
        <ConversationHeader
          conversation={conversation}
          phoneNumber={phoneNumber}
        />

        <div className="flex items-center gap-4">
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
              <DropdownMenuItem onSelect={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>

              {/* Separator */}
              <div className="h-px bg-muted my-1" />

              {/* Export Contacts options */}
              <DropdownMenuItem className="font-medium" disabled>
                Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts("pdf")}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts("csv")}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="bg-white border-gray-100">
        <div
          className="flex justify-between px-2 py-1 items-center border-b cursor-pointer"
          onClick={() => setIsReminderExpanded(!isReminderExpanded)}
        >
          <span className="text-xs font-medium text-gray-500">
            Important Reminder
          </span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isReminderExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Animated collapsible content */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isReminderExpanded ? "max-h-30" : "max-h-0"
          }`}
        >
          <div className="px-1 py-1">
            <ResolveReminder />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: "url('/original.png?height=500&width=500')",
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="flex flex-col gap-2">
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
                        {formatMessage(message.content)}
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
                        {formatMessage(message.answer)}
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

          {currentMessages.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No messages yet.</p>
            </div>
          )}
          <div className="h-4" ref={dummyRef} />
          {/* Scroll to Bottom Button - */}
          <ScrollToBottomButton
            targetRef={dummyRef}
            threshold={150}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#f0f2f5 gap-2">
        <MessageInput
          customerNumber={
            conversation.customer_number || conversation.recipient_id
          }
          phoneNumber={phoneNumber}
          onMessageSent={refreshMessages}
        />
      </div>
    </div>
  );
}
