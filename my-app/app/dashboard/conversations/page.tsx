"use client";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface Conversation {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

enum Channel {
  Website = "Website (Elli)",
  SocialMedia = "Social Media",
  Calls = "Calls",
  Email = "Email",
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          "https://intelli-python-backend.onrender.com/conversations"
        );
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  return (
    <div className="grid min-h-screen w-full">
      <div className="flex p-4">
        <div className="bg-white border border-gray-100 rounded-md p-4">
          <div className="flex flex-col">
            <div className="border-b">
              
              <div className="flex h-16 items-center px-4">
                <h1 className="text-2xl font-bold">Channels</h1>
              </div>
            </div>
            <div className="bg-white border border-gray-50 rounded-md p-4 y-2">
        <div className="flex flex-col">          
          <button
            className={`p-2 rounded-md ${
              selectedChannel === Channel.Website
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleChannelClick(Channel.Website)}
          >
            Website (Elli)
          </button>
          <button
            className={`p-2 rounded-md ${
              selectedChannel === Channel.SocialMedia
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleChannelClick(Channel.SocialMedia)}
          >
            Social Media
          </button>
          <button
            className={`p-2 rounded-md ${
              selectedChannel === Channel.Calls
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleChannelClick(Channel.Calls)}
          >
            Calls
          </button>
          <button
            className={`p-2 rounded-md ${
              selectedChannel === Channel.Email
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleChannelClick(Channel.Email)}
          >
            Email
          </button>
        </div>
      </div>
            
          </div>
        </div>
        <div className="ml-4 bg-white border border-gray-300 rounded-md p-4 flex-1">
          {selectedChannel && (
            <div className="p-4 border rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{selectedChannel}</span>
              </div>
              {conversations
                .filter(
                  (conversation) => conversation.sender === selectedChannel
                )
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 border rounded-lg shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {conversation.sender}
                      </span>
                      <span className="text-sm text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p>{conversation.message}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
