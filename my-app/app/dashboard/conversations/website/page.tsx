"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { CountryInfo } from "@/components/country-info";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Search, Settings, MoreVertical, ArrowUp } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Visitor {
  id: number;
  visitor_id: string;
  visitor_email: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  ip_address: string;
  created_at: string;
  last_seen: string;
  messages: Array<{
    id: number;
    content: string;
    answer: string;
    timestamp: string;
  }>;
}

interface Widget {
  id: number;
  widget_name: string;
  widget_key: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const distance = formatDistanceToNow(date, { addSuffix: true });

  if (distance.includes("less than a minute ago")) {
    return "just now";
  } else if (distance.includes("minute") || distance.includes("hour")) {
    return distance;
  } else {
    return format(date, "EEEE do MMMM yyyy");
  }
}

export default function WebsiteConvosPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [selectedWidgetKey, setSelectedWidgetKey] = useState<string>("");
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  useEffect(() => {
    const fetchWidgets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/widgets/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch widgets: ${response.statusText}`);
        }
        const data = await response.json();
        setWidgets(data);
        setSelectedWidgetKey(data[0]?.widget_key || "");
      } catch (error) {
        console.error("Error fetching widgets:", error);
        setError("Failed to load widgets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  useEffect(() => {
    if (!selectedWidgetKey) return;

    const fetchVisitors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/widgets/${selectedWidgetKey}/visitors/`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch visitors for widget: ${response.statusText}`
          );
        }
        const data = await response.json();
        setVisitors(
          data.sort(
            (a: Visitor, b: Visitor) =>
              new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
          )
        );
      } catch (error) {
        console.error("Error fetching visitors:", error);
        setError("Failed to load visitors.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, [selectedWidgetKey]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileSheetOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVisitorSelect = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowDetails(false);
    if (window.innerWidth < 640) {
      setIsMobileSheetOpen(true);
    }
  };

  const handleSendReply = async () => {
    if (!selectedVisitor || !replyMessage.trim()) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/widgets/${selectedWidgetKey}/visitors/${selectedVisitor.visitor_id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      setSelectedVisitor((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now(),
              content: "",
              answer: replyMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });

      setReplyMessage("");
    } catch (error) {
      console.error("Error sending reply:", error);
      setError("Failed to send reply. Please try again.");
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.visitor_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Website Widget Conversations</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-60">
              <Select
                value={selectedWidgetKey}
                onValueChange={setSelectedWidgetKey}
                disabled={isLoading}
              >
                <SelectTrigger className="p-2 border rounded">
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
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden border gray-100 rounded-md">
          {/* Visitor List - Visible on all screens */}
          <aside className="w-full sm:w-80 border-r gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search visitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : (
                <div className="divide-y">
                  {filteredVisitors.map((visitor) => {
                    const latestMessage =
                      visitor.messages[visitor.messages.length - 1];
                    return (
                      <button
                        key={visitor.id}
                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 ${
                          selectedVisitor?.id === visitor.id
                            ? "bg-gray-100"
                            : ""
                        }`}
                        onClick={() => handleVisitorSelect(visitor)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="font-medium truncate">
                              {visitor.visitor_id}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(visitor.last_seen)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {latestMessage
                              ? latestMessage.content
                              : "No messages yet"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </aside>

          {/* Desktop Chat View - Hidden on mobile */}
          <main className="flex-1 flex-col hidden sm:flex flex flex-col overflow-hidden">
            {selectedVisitor ? (
              <>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div>
                      <h2 className="font-medium">
                        {selectedVisitor.visitor_id}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedVisitor.last_seen)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedVisitor.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.content ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[80%] ${
                            message.content
                              ? "bg-green-200"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          <p className="break-words">
                            {message.content || message.answer}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.content
                                ? "text-gray-500"
                                : "text-blue-100"
                            }`}
                          >
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <Card className="mx-2 border shadow-sm">
                    <div className="flex items-center p-1">
                      <Input
                        placeholder="Reply to customer..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="w-full border-none"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="default"
                        className="ml-2"
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a visitor to start chatting
              </div>
            )}
          </main>

          {/* Mobile Chat Sheet */}
          {typeof window !== "undefined" && window.innerWidth < 640 && (
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetContent side="bottom" className="h-[90vh] p-0">
                {selectedVisitor && (
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div>
                          <SheetTitle>{selectedVisitor.visitor_id}</SheetTitle>
                          <p className="text-sm text-gray-500">
                            {formatDate(selectedVisitor.last_seen)}
                          </p>
                        </div>
                      </div>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {selectedVisitor.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.content ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-lg max-w-[80%] ${
                                message.content
                                  ? "bg-gray-100"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              <p className="break-words">
                                {message.content || message.answer}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.content
                                    ? "text-gray-500"
                                    : "text-blue-100"
                                }`}
                              >
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-white">
                      <Card className="mx-2 border shadow-sm">
                        <div className="flex items-center p-1">
                          <Input
                            placeholder="Reply to customer..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            variant="default"
                            className="ml-2"
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim()}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}

          {/* Details Sidebar - Hidden on mobile */}
          {showDetails && selectedVisitor && (
            <aside className="w-80 border-l p-4 hidden lg:block">
              <h3 className="text-lg font-bold mb-4">Visitor Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedVisitor.visitor_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedVisitor.visitor_email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedVisitor.visitor_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <CountryInfo ip={selectedVisitor.ip_address} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    First Seen
                  </p>
                  <p>{formatDate(selectedVisitor.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Seen</p>
                  <p>{formatDate(selectedVisitor.last_seen)}</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
