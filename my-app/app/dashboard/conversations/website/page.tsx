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
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { useWebsiteWidgets } from "@/hooks/use-website-widgets";
import { useWebsiteVisitors } from "@/hooks/use-website-visitors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Message {
  id: number;
  content: string;
  answer?: string;
  timestamp?: string;
  sender_type?: string;
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

// Get last message preview
function getLastMessagePreview(visitor: Visitor): string {
  if (!visitor.messages || visitor.messages.length === 0) return 'No messages yet';

  const lastMessage = visitor.messages[visitor.messages.length - 1];
  const text = lastMessage.answer || lastMessage.content;
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

export default function WebsiteConversationsPage() {
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [selectedWidgetKey, setSelectedWidgetKey] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [showVisitorInfo, setShowVisitorInfo] = useState(false);
  const activeOrganizationId = useActiveOrganizationId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

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
  } = useWebsiteVisitors(selectedWidgetKey, API_BASE_URL || "");

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

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);

        // Handle new messages
        if (data.type === 'business_forward' || data.type === 'new_chat') {
          refetchVisitors();
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [activeOrganizationId, refetchVisitors]);

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

    const lastMessage = selectedVisitor.messages && selectedVisitor.messages.length > 0
      ? selectedVisitor.messages[selectedVisitor.messages.length - 1]
      : undefined;
    const lastMessageContent = lastMessage?.content || "";

    const payload = {
      action: "send_message",
      widget_key: selectedWidgetKey,
      visitor_id: selectedVisitor.visitor_id,
      answer: replyMessage,
      message: lastMessageContent,
    };

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/`
    );

    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();

      // Optimistically add message to UI
      setSelectedVisitor((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: Date.now(),
              content: lastMessageContent,
              answer: replyMessage,
              timestamp: new Date().toISOString(),
              sender_type: 'business'
            },
          ],
        };
      });

      setReplyMessage("");
      toast.success("Message sent");
    };

    ws.onerror = () => {
      toast.error("Failed to send message");
    };
  };

  const handleTakeover = async () => {
    if (!selectedVisitor || !activeOrganizationId) return;

    const action = selectedVisitor.is_handle_by_human ? "handover" : "takeover";

    const payload = {
      action,
      widget_key: selectedWidgetKey,
      visitor_id: selectedVisitor.visitor_id,
    };

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/`
    );

    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();

      setSelectedVisitor(prev => prev ? {...prev, is_handle_by_human: !prev.is_handle_by_human} : null);
      toast.success(
        action === "takeover" ? "You are now handling this chat" : "Chat handed over to AI"
      );
    };

    ws.onerror = () => {
      toast.error("Action failed. Please try again");
    };
  };

  const filteredVisitors = visitors.filter((visitor) =>
    getVisitorDisplayName(visitor).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
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
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
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
                      setShowVisitorInfo(false);
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

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {visitor.is_handle_by_human && (
                            <span className="text-blue-600 font-medium mr-1">You:</span>
                          )}
                          {getLastMessagePreview(visitor)}
                        </p>

                        {/* Unread badge */}
                        {visitor.unread_count && visitor.unread_count > 0 && (
                          <span className="ml-2 bg-green-500 text-white text-xs font-semibold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                            {visitor.unread_count}
                          </span>
                        )}
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
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-0 hover:bg-transparent h-auto"
                onClick={() => setShowVisitorInfo(!showVisitorInfo)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {getVisitorDisplayName(selectedVisitor).charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="font-semibold text-gray-900">
                    {getVisitorDisplayName(selectedVisitor)}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    click for more info
                    <ChevronDown className="h-3 w-3" />
                  </p>
                </div>
              </Button>

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
              <div className="max-w-4xl mx-auto space-y-3">
                {(selectedVisitor.messages || []).map((message, index) => (
                  <div key={message.id} className="space-y-2">
                    {/* Visitor Message */}
                    {message.content && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg shadow-sm max-w-[70%] p-3">
                          <div className="markdown-content text-gray-800 text-sm">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Business/AI Response */}
                    {message.answer && (
                      <div className="flex justify-end">
                        <div className="bg-[#d9fdd3] rounded-lg shadow-sm max-w-[70%] p-3">
                          <div className="markdown-content text-gray-800 text-sm">
                            {message.answer}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs text-gray-600">
                              {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
                            </span>
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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

        {/* Visitor Info Card - Small Overlay */}
        {showVisitorInfo && selectedVisitor && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 z-20 backdrop-blur-sm"
              onClick={() => setShowVisitorInfo(false)}
            />

            {/* Info Card */}
            <div className="absolute top-20 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-30 overflow-hidden animate-in slide-in-from-top-5 fade-in duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  <button
                    onClick={() => setShowVisitorInfo(false)}
                    className="hover:bg-white/20 p-1 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 max-h-[500px] overflow-y-auto">
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-2xl">
                    {getVisitorDisplayName(selectedVisitor).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {getVisitorDisplayName(selectedVisitor)}
                    </h4>
                    <p className="text-sm text-gray-500">Website Visitor</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  {selectedVisitor.visitor_email && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                        <p className="text-sm text-gray-900">{selectedVisitor.visitor_email}</p>
                      </div>
                    </div>
                  )}

                  {selectedVisitor.visitor_phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Phone</p>
                        <p className="text-sm text-gray-900">{selectedVisitor.visitor_phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Location</p>
                      <CountryInfo ip={selectedVisitor.ip_address || ""} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">First Seen</p>
                      <p className="text-sm text-gray-900">{selectedVisitor.created_at ? format(new Date(selectedVisitor.created_at), 'PPp') : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Last Seen</p>
                      <p className="text-sm text-gray-900">{selectedVisitor.last_seen ? format(new Date(selectedVisitor.last_seen), 'PPp') : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Visitor ID</p>
                      <p className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{selectedVisitor.visitor_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
