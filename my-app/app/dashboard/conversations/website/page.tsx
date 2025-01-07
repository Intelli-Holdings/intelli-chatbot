"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Conversation {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

interface Assistant {
  id: string;
  name: string;
}

export default function WebsiteConvosPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Fetch available assistants
    const fetchAssistants = async () => {
      try {
        const orgId = "your-org-id"; // Replace with dynamic orgId if available
        const response = await fetch(
          `${API_BASE_URL}/api/get/assistants/${orgId}`
        );
        const data = await response.json();
        setAssistants(data);
      } catch (error) {
        console.error("Error fetching assistants:", error);
      }
    };

    fetchAssistants();
  }, []);

  useEffect(() => {
    // Fetch conversations for the selected assistant
    if (!selectedAssistantId) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/widgets/${selectedAssistantId}/visitors/`
        );
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [selectedAssistantId]);

  return (
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4 justify-between">
            <h1 className="text-2xl font-bold">Website Widget Conversations</h1>
            <div className="w-60"> {/* Set a fixed width or max-width for the Select */}
    <Select
      value={selectedAssistantId || ""}
      onValueChange={(value) => setSelectedAssistantId(value)}
    >
      <SelectTrigger className="p-2 border rounded">
        <SelectValue placeholder="Select an assistant" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id}>
              {assistant.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid gap-4">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 border rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {conversation.sender}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(conversation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p>{conversation.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No conversations available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
