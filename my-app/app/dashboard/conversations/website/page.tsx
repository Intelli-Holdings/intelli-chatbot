"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { CountryInfo } from "@/components/country-info";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Send, MoreVertical, CheckCheck, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useAuth } from "@clerk/nextjs";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { useWebsiteWidgets } from "@/hooks/use-website-widgets";
import { useWebsiteVisitors } from "@/hooks/use-website-visitors";
import { cn } from "@/lib/utils";
import "../components/message-bubble.css";
import { WebsiteSkeletonLoader, VisitorListSkeleton } from "../components/website-skeleton-loader";
import { useQueryClient } from "react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Message {
  id: number;
  content: string;
  answer?: string;
  timestamp?: string;
  sender_type?: string;
  sender?: string; // 'customer', 'ai', or 'human'
}

interface Visitor {
  id: number;
  visitor_id: string;
  visitor_email?: string | null;
  visitor_name?: string | null;
  visitor_phone?: string | null;
  ip_address?: string;
  created_at?: string;
  last_seen?: string;
  is_handle_by_human?: boolean;
  messages?: Message[];
  unread_count?: number;
}

interface Widget {
  id: number;
  widget_name: string;
  widget_key: string;
}

// Format time like WhatsApp
function formatMessageTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'dd/MM/yyyy');
  }
}

// Get display name for visitor
function getVisitorDisplayName(visitor: Visitor): string {
  return visitor.visitor_name || visitor.visitor_email || visitor.visitor_phone || visitor.visitor_id;
}

// Get last message preview - truncate and clean up whitespace
function getLastMessagePreview(visitor: Visitor, maxLength: number = 35): string {
  if (!visitor.messages || visitor.messages.length === 0) return 'No messages yet';

  const lastMessage = visitor.messages[visitor.messages.length - 1];
  const text = lastMessage.answer || lastMessage.content || '';
  // Clean up whitespace and newlines
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength).trim() + '...';
}

export default function WebsiteConversationsPage() {
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [selectedWidgetKey, setSelectedWidgetKey] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const activeOrganizationId = useActiveOrganizationId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    widgets,
    isLoading: widgetsLoading,
    error: widgetsError,
  } = useWebsiteWidgets(activeOrganizationId || undefined, API_BASE_URL || "");

  const {
    visitors: rawVisitors,
    isLoading: visitorsLoading,
    error: visitorsError,
    refetch: refetchVisitors,
  } = useWebsiteVisitors(selectedWidgetKey);

  const isLoading = widgetsLoading || visitorsLoading;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedVisitor?.messages]);

  useEffect(() => {
    if (!selectedWidgetKey && widgets.length > 0) {
      setSelectedWidgetKey(widgets[0].widget_key);
    }
  }, [widgets, selectedWidgetKey]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!activeOrganizationId) return;

    const setupWebSocket = async () => {
      const token = await getToken({ organizationId: activeOrganizationId });
      if (!token) {
        logger.error("Cannot establish WebSocket connection: No authentication token");
        return;
      }

      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/?token=${token}`
      );

      ws.onopen = () => {
        logger.info("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logger.debug("WebSocket message received", { data });

          // Handle new messages
          if (data.type === 'business_forward' || data.type === 'new_chat') {
            refetchVisitors();
          }
        } catch (error) {
          logger.error("WebSocket message error", { error: error instanceof Error ? error.message : String(error) });
        }
      };

      ws.onerror = (error) => {
        logger.error("WebSocket error", { error: error instanceof Error ? error.message : String(error) });
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    };

    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeOrganizationId, refetchVisitors, getToken]);

  useEffect(() => {
    if (widgetsError) {
      toast.error(widgetsError);
    }
  }, [widgetsError]);

  useEffect(() => {
    if (visitorsError) {
      toast.error(visitorsError);
    }
  }, [visitorsError]);

  const visitors = useMemo(() => {
    const sorted = [...rawVisitors].sort((a, b) =>
      new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime()
    );

    return sorted.map((visitor) => ({
      ...visitor,
      unread_count: Math.floor(Math.random() * 5),
    }));
  }, [rawVisitors]);

  const handleSendMessage = async () => {
    if (!selectedVisitor || !replyMessage.trim() || !activeOrganizationId) return;
    const targetVisitor = selectedVisitor;
    const targetWidgetKey = selectedWidgetKey;

    const token = await getToken({ organizationId: activeOrganizationId });
    if (!token) {
      toast.error("Authentication failed");
      return;
    }

    const lastVisitorMessage = [...(targetVisitor.messages || [])]
      .reverse()
      .find((message) => {
        const senderType = message.sender_type
        const isBusinessMessage = senderType === "business" || senderType === "assistant" || senderType === "human"
        return Boolean(message.content) && !isBusinessMessage
      })
    const lastMessageContent = lastVisitorMessage?.content || ""

    const payload = {
      action: "send_message",
      widget_key: targetWidgetKey,
      visitor_id: targetVisitor.visitor_id,
      answer: replyMessage,
      message: lastMessageContent,
    };

    // Optimistically add message to UI immediately
    const optimisticMessage = {
      id: Date.now(),
      content: lastMessageContent,
      answer: replyMessage,
      timestamp: new Date().toISOString(),
      sender_type: 'business',
      sender: 'business'
    };

    setSelectedVisitor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [
          ...(prev.messages || []),
          optimisticMessage,
        ],
      };
    });

    queryClient.setQueryData<Visitor[]>(["website-visitors", targetWidgetKey], (prev = []) =>
      prev.map((visitor) => {
        if (visitor.visitor_id !== targetVisitor.visitor_id) return visitor;
        return {
          ...visitor,
          messages: [...(visitor.messages || []), optimisticMessage],
        };
      })
    );

    setReplyMessage("");

    // Send message via WebSocket after UI update
    const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/?token=${token}`
      );

    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();
      toast.success("Message sent");
    };

    ws.onerror = () => {
      toast.error("Failed to send message");
      // TODO: Could implement rollback of optimistic update here if needed
    };
  };

  const handleTakeover = async () => {
    if (!selectedVisitor || !activeOrganizationId) return;

    const action = selectedVisitor.is_handle_by_human ? "handover" : "takeover";

    try {
      const response = await fetch("/api/widgets/takeover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          visitor_id: selectedVisitor.visitor_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update chat status");
      }

      // Update local state only after successful API call
      setSelectedVisitor(prev => prev ? {...prev, is_handle_by_human: !prev.is_handle_by_human} : null);

      // Update the visitors list as well
      queryClient.setQueryData<Visitor[]>(["website-visitors", selectedWidgetKey], (prev = []) =>
        prev.map((visitor) => {
          if (visitor.visitor_id !== selectedVisitor.visitor_id) return visitor;
          return {
            ...visitor,
            is_handle_by_human: !visitor.is_handle_by_human,
          };
        })
      );

      toast.success(
        action === "takeover" ? "You are now handling this chat" : "Chat handed over to AI"
      );
    } catch (error) {
      logger.error("Takeover error", { error: error instanceof Error ? error.message : String(error) });
      toast.error(error instanceof Error ? error.message : "Action failed. Please try again");
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    getVisitorDisplayName(visitor).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show full page skeleton loader during initial widget loading
  if (widgetsLoading && widgets.length === 0) {
    return <WebsiteSkeletonLoader />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#e9edef] bg-white shadow-lg">
      {/* Left Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-white border-r border-[#e9edef] flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Chats</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Widget Selector */}
          <Select value={selectedWidgetKey} onValueChange={setSelectedWidgetKey}>
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Select a widget" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {widgets.map((widget) => (
                  <SelectItem key={widget.id} value={widget.widget_key}>
                    {widget.widget_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {visitorsLoading ? (
            <VisitorListSkeleton count={7} />
          ) : filteredVisitors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No conversations yet</div>
          ) : (
            <div>
              {filteredVisitors.map((visitor) => {
                const lastMessage = visitor.messages && visitor.messages.length > 0
                  ? visitor.messages[visitor.messages.length - 1]
                  : undefined;
                const isSelected = selectedVisitor?.id === visitor.id;

                return (
                  <button
                    key={visitor.id}
                    onClick={() => {
                      setSelectedVisitor(visitor);
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                      isSelected ? "bg-gray-100" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                        {getVisitorDisplayName(visitor).charAt(0).toUpperCase()}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getVisitorDisplayName(visitor)}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {lastMessage?.timestamp ? formatMessageTime(lastMessage.timestamp) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate flex-1 min-w-0">
                          {visitor.is_handle_by_human && (
                            <span className="text-blue-600 font-medium mr-1">You:</span>
                          )}
                          {getLastMessagePreview(visitor)}
                        </p>

                       
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        {selectedVisitor ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-0 hover:bg-transparent h-auto"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${getVisitorDisplayName(selectedVisitor)}.png`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                          {getVisitorDisplayName(selectedVisitor).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col items-start">
                      <h2 className="text-[15px] font-normal text-[#111b21]">
                        {getVisitorDisplayName(selectedVisitor)}
                      </h2>
                      <p className="text-[12px] text-[#667781] flex items-center gap-1">
                        click for more info
                        <ChevronDown className="h-3 w-3" />
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-0">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center pt-8 pb-6 bg-[#f0f2f5]">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${getVisitorDisplayName(selectedVisitor)}.png`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl">
                            {getVisitorDisplayName(selectedVisitor).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-normal text-[#111b21] mb-1">
                          {getVisitorDisplayName(selectedVisitor)}
                        </h3>
                        <p className="text-[13px] text-[#667781]">
                          Last active{" "}
                          {selectedVisitor.last_seen
                            ? format(new Date(selectedVisitor.last_seen), "MMM d, h:mm a")
                            : "Unknown"}
                        </p>
                      </div>
                      <div className="p-4 border-t border-[#e9edef]">
                        <div className="space-y-4">
                          {selectedVisitor.visitor_email && (
                            <div>
                              <label className="text-[12px] text-[#667781]">Email</label>
                              <p className="text-[14px] font-normal text-[#111b21]">
                                {selectedVisitor.visitor_email}
                              </p>
                            </div>
                          )}
                          {selectedVisitor.visitor_phone && (
                            <div>
                              <label className="text-[12px] text-[#667781]">Phone number</label>
                              <p className="text-[14px] font-normal text-[#111b21]">
                                {selectedVisitor.visitor_phone}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="text-[12px] text-[#667781]">Location</label>
                            <div className="text-[14px] font-normal text-[#111b21]">
                              <CountryInfo ip={selectedVisitor.ip_address || ""} />
                            </div>
                          </div>
                          {selectedVisitor.created_at && (
                            <div>
                              <label className="text-[12px] text-[#667781]">First Seen</label>
                              <p className="text-[14px] font-normal text-[#111b21]">
                                {format(new Date(selectedVisitor.created_at), "PPp")}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="text-[12px] text-[#667781]">Visitor ID</label>
                            <p className="text-[14px] font-mono text-[#111b21] bg-gray-50 px-2 py-1 rounded break-all">
                              {selectedVisitor.visitor_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <Button
                  className={`h-9 px-3 text-xs text-white rounded-md shadow-sm transition-colors ${
                    !selectedVisitor.is_handle_by_human
                      ? "bg-[#007fff] hover:bg-[#0066cc] border-[#007fff]"
                      : "bg-green-600 hover:bg-green-700 border-green-600"
                  }`}
                  onClick={handleTakeover}
                >
                  {!selectedVisitor.is_handle_by_human ? "Take Over" : "Hand to AI"}
                </Button>
              </div>
            </div>

            {/* Reminder banner when human is handling */}
            {selectedVisitor.is_handle_by_human && (
              <div className="bg-[#fef4e6] border-b border-[#f9e6c4] px-4 py-2">
                <p className="text-xs text-[#54656f] text-center">
                  Remember to hand over to AI when you&apos;re done sending messages.
                </p>
              </div>
            )}

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}>
              <div className="flex flex-col gap-2">
                {(selectedVisitor.messages || []).map((message) => {
                  const senderType = message.sender_type
                  const isBusinessMessage = senderType === "business" || senderType === "assistant" || senderType === "human"

                  // For response messages (answer field exists), determine if AI or human
                  // If sender_type is explicitly set, use it. Otherwise default to 'ai' for backward compatibility
                  const responseSenderType = message.sender_type === 'business' || message.sender_type === 'human'
                    ? 'human'
                    : message.sender || 'ai';

                  return (
                    <div key={message.id} className="flex flex-col gap-2">
                      {/* Customer Message (incoming) */}
                      {message.content && !isBusinessMessage && (
                        <div className="flex justify-start">
                          <div
                            className={cn(
                              "message-bubble group message-customer"
                            )}
                          >
                            <div className="message-tail message-tail-left" />
                            <div className="text-[9px] font-semibold text-gray-600 mb-1">
                              Visitor
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[11px] text-[#667781]">
                                {message.timestamp && format(new Date(message.timestamp), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Business/AI Response (outgoing) */}
                      {message.answer && (
                        <div className="flex justify-end">
                          <div
                            className={cn(
                              "message-bubble group",
                              responseSenderType === "ai" ? "message-assistant" : "message-human"
                            )}
                          >
                            <div
                              className={`message-tail ${
                                responseSenderType === "ai" ? "message-tail-right-assistant" : "message-tail-right-human"
                              }`}
                            />
                            {/* Sender badge - AI or Human */}
                            <div className={cn(
                              "text-[9px] font-semibold mb-1",
                              responseSenderType === "ai" ? "text-purple-600" : "text-green-700"
                            )}>
                              {responseSenderType === "ai" ? "🤖 AI Assistant" : "👤 Business"}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{message.answer}</div>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[11px] text-[#667781]">
                                {message.timestamp && format(new Date(message.timestamp), 'HH:mm')}
                              </span>
                              <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-gray-100 border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <Input
                  placeholder="Type a message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-white rounded-full px-4 py-3"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!replyMessage.trim()}
                  className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700"
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Welcome to Website Chat
                </h2>
                <p className="text-gray-600">
                  Select a conversation to start messaging with your visitors
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
