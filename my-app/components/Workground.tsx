"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Send, X } from 'lucide-react';
import { DeploymentDialog } from '@/components/deployment-dialog';
import { useToast } from "@/components/ui/use-toast";

export default function Workground() {
  const { organization } = useOrganization();
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { toast } = useToast();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [assistantId, setAssistantId] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://example.com");
  const [widgetName, setWidgetName] = useState<string>("Elli");
  const [avatarUrl, setAvatarUrl] = useState<string>("/Avatar.png");
  const [brandColor, setBrandColor] = useState<string>("#007fff");
  const [greetingMessage, setGreetingMessage] = useState<string>("Hello! I'm Elli, Ask me anything about Intelli?");
  const [showWelcomeDialog, setShowWelcomeDialog] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && userMemberships.data && userMemberships.data.length > 0) {
      setSelectedOrganizationId(userMemberships.data[0].organization.id);
    }
  }, [isLoaded, userMemberships.data]);

  useEffect(() => {
    setAssistantId(uuidv4());
  }, []);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if (newMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: newMessage },
        {
          role: "assistant",
          content: `Response from assistant: ${newMessage}`,
        },
      ]);
      setNewMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      organizationId: selectedOrganizationId,
      assistantId,
      websiteUrl,
      widgetName,
      avatarUrl,
      brandColor,
      greetingMessage,
    };

    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create assistant');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message,
      });

      // Reset form or navigate to a new page
      setAssistantId(uuidv4()); // Generate a new ID for the next assistant
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create assistant. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 p-2">
      <div className="md:w-1/2 bg-white shadow-md p-2 rounded-lg">
        <form onSubmit={handleSubmit} className="w-full h-[600px] bg-gray-300/10 p-4 sm:p-4 border rounded-lg border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Creation Board</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
              <Select 
                value={selectedOrganizationId} 
                onValueChange={setSelectedOrganizationId}
                disabled={!isLoaded}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {isLoaded && userMemberships.data && userMemberships.data.map((membership) => (
                      <SelectItem key={membership.organization.id} value={membership.organization.id}>
                        {membership.organization.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Assistant ID</label>
              <Input value={assistantId} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Website URL</label>
              <Input 
                value={websiteUrl} 
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Widget Name</label>
              <Input 
                value={widgetName} 
                onChange={(e) => setWidgetName(e.target.value)}
                placeholder="My Chat Widget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Avatar</label>
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="Assistant Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Avatar
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Brand Color</label>
              <div className="flex items-center space-x-2">
                <Input 
                  type="color"
                  value={brandColor} 
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-12 p-1"
                />
                <Input 
                  value={brandColor} 
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#007fff"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Greeting Message</label>
              <Input 
                value={greetingMessage} 
                onChange={(e) => setGreetingMessage(e.target.value)}
                placeholder="Welcome! How can I assist you today?"
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">Create Assistant</Button>
          <DeploymentDialog assistantId={assistantId} />
        </form>
      </div>

      <div className="md:w-1/2 flex items-center justify-center">
        <div className="flex flex-col w-full max-w-[400px] mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
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
              <p className="text-sm text-gray-600">
                {widgetName} is an AI assistant that has been trained to answer questions about Intelli. 
                Please review the Intelli Privacy Statement to understand how we process your information.
              </p>
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
                      msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={avatarUrl}
                          alt={widgetName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
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
      </div>
    </div>
  );
}

