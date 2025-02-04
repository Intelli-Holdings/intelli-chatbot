"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useOrganizationList } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Send, X } from 'lucide-react';
import { toast } from "sonner";

interface WidgetCommunicationProps {
  widgetName: string;
  avatarUrl: string;
  brandColor: string;
  greetingMessage: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function WidgetCommunication({
  widgetName,
  avatarUrl,
  brandColor,
  greetingMessage,
}: WidgetCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showWelcomeDialog, setShowWelcomeDialog] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { isLoaded, userMemberships } = useOrganizationList();

  const connectToWidget = useCallback((organizationId: string) => {
    const socket = new WebSocket(`ws://intelli-python-backend-lxui.onrender.com/ws/business/chat/${organizationId}/`);

    socket.onopen = () => {
      setIsConnected(true);
      toast.success("You are successfully connected to the widget. You can now chat.");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.onclose = () => {
      setIsConnected(false);
      toast.error("Disconnected from the widget");
    };

    socketRef.current = socket;
  }, []);

  const handleSendMessage = () => {
    if (newMessage && isConnected) {
      const message: Message = { role: "user", content: newMessage };
      setMessages((prevMessages) => [...prevMessages, message]);
      socketRef.current?.send(JSON.stringify(message));
      setNewMessage("");
    } else if (!isConnected) {
      toast.info("You are not yet connected to the widget. Please try again.");
    }
  };

  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      // Select the first organization ID as an example
      const organizationId = userMemberships.data[0].organization.id;
      connectToWidget(organizationId);
    } else {
      toast.error("No organizations found for the user.");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isLoaded, useOrganizationList, connectToWidget]);

  return (
    <div className="flex flex-col w-full max-w-[400px] mx-auto bg-white rounded-xl overflow-hidden shadow-md">
      <div
        className="flex items-center p-4 text-white"
        style={{ backgroundColor: brandColor }}
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
          <Image
            src={avatarUrl}
            alt={widgetName}
            fill
            className="object-cover"
          />
        </div>
        <span className="font-semibold">{widgetName}</span>
      </div>

      {showWelcomeDialog && (
        <div className="relative m-4 p-4 bg-white rounded-lg border shadow-sm">
          <button
            onClick={() => setShowWelcomeDialog(false)}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="font-semibold mb-2">Welcome to {widgetName}</h3>
          <p className="text-sm text-gray-600">{greetingMessage}</p>
        </div>
      )}

      <div className="flex-1 p-4">
        <ScrollArea className="h-[400px]">
          {messages.length === 0 ? (
            <div className="flex items-start space-x-2 mb-4">
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={avatarUrl}
                  alt={widgetName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">{greetingMessage}</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 mb-4 ${
                  msg.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Chat with your assistant..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            style={{ backgroundColor: brandColor }}
            className="text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
