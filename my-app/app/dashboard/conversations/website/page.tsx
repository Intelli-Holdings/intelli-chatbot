"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { CountryInfo } from "@/components/country-info";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Settings, MoreVertical, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";
import useActiveOrganizationId from "@/hooks/use-organization-id";

const markdownStyles = `
  .markdown-content {
    overflow-wrap: break-word;
  }
  .markdown-content p {
    margin-bottom: 0.5em;
  }
  .markdown-content ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.5em;
  }
  .markdown-content h1, 
  .markdown-content h2, 
  .markdown-content h3 {
    font-weight: bold;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
`;

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
  const [markedLoaded, setMarkedLoaded] = useState(false);
  const activeOrganizationId = useActiveOrganizationId();

  const [isHumanSupport, setIsHumanSupport] = useState(false);
  const [isSupportActionLoading, setIsSupportActionLoading] = useState(false);
  const [supportAction, setSupportAction] = useState<"takeover" | "handover" | null>(null);

  const fetchWidgets = async (orgId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/widgets/organization/${orgId}/all/`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch widgets: ${response.statusText}`);
      }

      const data = await response.json();
      setWidgets(data);
      setSelectedWidgetKey(data[0]?.widget_key || "");
    } catch (error) {
      console.error("Error fetching widgets:", error);
      setError("Failed to load widgets.");
      toast.error("Failed to load widgets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganizationId) {
      fetchWidgets(activeOrganizationId);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    if (!selectedWidgetKey) return;

    const fetchVisitors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/widgets/widget/${selectedWidgetKey}/visitors/`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch visitors for widget: ${response.statusText}`
          );
        }
        toast.info("Failed to fetch visitors for widget.");

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
        toast.error("Failed to load visitors.");
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

  useEffect(() => {
    // Add markdown styles
    const styleElement = document.createElement("style");
    styleElement.textContent = markdownStyles;
    document.head.appendChild(styleElement);

    loadDependencies();

    return () => {
      styleElement.remove();
    };
  }, []);

  const loadDependencies = () => {
    return new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
      script.onload = () => {
        // Configure marked options for proper Markdown rendering
        marked.setOptions({
          // sanitize: false, // Allow HTML to enable proper list rendering
          breaks: true,
          gfm: true, // Enable GitHub Flavored Markdown
          // headerIds: false, // Disable header IDs to keep it simple
          //mangle: false // Disable mangling to preserve text
        });
        setMarkedLoaded(true);
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  const handleVisitorSelect = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowDetails(false);
    if (window.innerWidth < 640) {
      setIsMobileSheetOpen(true);
    }
  };

  const handleSendReply = () => {
    if (!selectedVisitor || !replyMessage.trim() || !activeOrganizationId) return;

    const lastMessageContent =
      selectedVisitor.messages[selectedVisitor.messages.length - 1]?.content || "";

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
console.log("ws", ws);

  ws.onopen = () => {
    ws.send(JSON.stringify(payload));
    ws.close();
    setSelectedVisitor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now(),
            content: lastMessageContent,
            answer: replyMessage,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });
    setReplyMessage("");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error (send reply):", error);
    toast.error("Failed to send reply. Please try again.");
  };
};
  const filteredVisitors = visitors.filter((visitor) =>
    visitor.visitor_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHandover = () => {
    if (!selectedVisitor || !activeOrganizationId) return;
    // Toggle action based on the current support state.
    const action = isHumanSupport ? "handover" : "takeover";
    setSupportAction(action);
    setIsSupportActionLoading(true);

    const payload = {
      action,
      widget_key: selectedWidgetKey,
      visitor_id: selectedVisitor.visitor_id,
    };

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/business/chat/${activeOrganizationId}/`
          
    );
    console.log("ws", ws);

    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();
      setIsHumanSupport(!isHumanSupport);
      setIsSupportActionLoading(false);
      setSupportAction(null);
      toast.success(
        `Successfully ${action === "takeover" ? "taken over" : "handed over"} AI support`
      );
    };

    ws.onerror = (error) => {
      console.error("WebSocket error (handover):", error);
      setIsSupportActionLoading(false);
      setSupportAction(null);
      toast.error("Please try again to takeover support from AI");
    };
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Website Widget Conversations</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-60"></div>
            <div className="w-60">
              <Select
                value={selectedWidgetKey}
                onValueChange={setSelectedWidgetKey}
                disabled={isLoading || !useActiveOrganizationId}
              >
                <SelectTrigger className="p-2 border rounded">
                  <SelectValue placeholder="Select a widget" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60 rounded-md shadow-sm">
                    <SelectGroup>
                      {widgets.map((widget) => (
                        <SelectItem key={widget.id} value={widget.widget_key}>
                          {widget.widget_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </ScrollArea>
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
                              ? latestMessage.content || latestMessage.answer
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
          <main className="flex-1 hidden sm:flex flex-col overflow-hidden">
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
                      <div key={message.id} className="space-y-2">
                        {message.content && (
                          <div className="flex justify-start">
                            <div className="markdown-content p-3 rounded-lg max-w-[80%] bg-green-200">
                              {/* eslint-disable-next-line react/no-danger */}
                              {markedLoaded ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: marked(message.content) as string,
                                  }}
                                />
                              ) : (
                                <p className="break-words">{message.content}</p>
                              )}
                              <p className="text-xs mt-1 text-gray-500">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        )}
                        {message.answer && (
                          <div className="flex justify-end">
                            <div className="markdown-content p-3 rounded-lg max-w-[80%] bg-blue-500 text-white">
                              {/* eslint-disable-next-line react/no-danger */}
                              {markedLoaded ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: marked(message.answer) as string,
                                  }}
                                />
                              ) : (
                                <p className="break-words">{message.answer}</p>
                              )}
                              <p className="text-xs mt-1 text-blue-100">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <Card className="mx-2 border shadow-sm p-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="ml-1 border border-blue-200 rounded-lg shadow-md"
                    onClick={handleHandover}
                    disabled={isSupportActionLoading || isLoading}
                  >
                    {isSupportActionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {supportAction === "takeover" ? "Taking over..." : "Handing over..."}
                    </>
                    ) : (
                    isHumanSupport ? "Handover to AI" : "Takeover AI"
                    )}
                  </Button>

                    {isHumanSupport && (
                      <div className="m-2 bg-purple-100 text-red-700 p-2 text-center border rounded-lg">
                        <p>
                          Remember to handover to AI when you&apos;re done
                          sending messages.
                        </p>
                      </div>
                    )}

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
                          <div key={message.id} className="space-y-2">
                            {message.content && (
                              <div className="flex justify-start">
                                <div className="markdown-content p-3 rounded-lg max-w-[80%] bg-gray-100">
                                  {/* eslint-disable-next-line react/no-danger */}
                                  {markedLoaded ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: marked(
                                          message.content
                                        ) as string,
                                      }}
                                    />
                                  ) : (
                                    <p className="break-words">
                                      {message.content}
                                    </p>
                                  )}
                                  <p className="text-xs mt-1 text-gray-500">
                                    {formatDate(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            )}
                            {message.answer && (
                              <div className="flex justify-end">
                                <div className="markdown-content p-3 rounded-lg max-w-[80%] bg-blue-500 text-white">
                                  {/* eslint-disable-next-line react/no-danger */}
                                  {markedLoaded ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: marked(
                                          message.answer
                                        ) as string,
                                      }}
                                    />
                                  ) : (
                                    <p className="break-words">
                                      {message.answer}
                                    </p>
                                  )}
                                  <p className="text-xs mt-1 text-blue-100">
                                    {formatDate(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-white">
                      <Card className="mx-2 border shadow-sm">
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-2 border border-blue-200 rounded-xl shadow-md"
                          onClick={handleHandover}
                        >
                          {isHumanSupport ? "Handover to AI" : "Takeover AI"}
                        </Button>

                        {isHumanSupport && (
                          <div className="w-full bg-purple-100 text-red-700 p-3 text-center">
                            <p>
                              Remember to handover to AI when you&apos;re done
                              sending messages.
                            </p>
                          </div>
                        )}

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
