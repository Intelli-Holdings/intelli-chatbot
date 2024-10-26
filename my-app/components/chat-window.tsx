"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import Image from 'next/image';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChatWindow() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hello! I'm Elli, your travel assistant. How can I help you plan your East African adventure today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { id: messages.length + 1, role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      // Add assistant message
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        role: "assistant",
        content: data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 bg-[#007FFF] text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              alt="Ellie's avatar"
              src="/Ellis.png"
            />
            <AvatarFallback>E</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-xs font-semibold">Elli</p>
          </div>
        </div>
      </div>

      <div className="justify-between p-1">
        <ScrollArea className="h-[calc(50vh-100px)]">
          <div>
            <Card className="shadow-lg border-none">
              <CardContent>
                <CardHeader>
                  <CardTitle>Welcome to Elli</CardTitle>
                  <CardDescription>
                    Elli is an AI assistant that has been trained to
                    answer inquiries about an East African travel agency business.
                  </CardDescription>
                </CardHeader>      
              </CardContent>
            </Card>
          </div>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${
                m.role === "user"
                  ? "flex items-end space-x-2"
                  : "flex items-start justify-end space-x-2"
              } px-4 py-2 space-y-2`}
            >
              {m.role === "user" ? (
                <Avatar>
                  <AvatarImage alt="User" src="/user.jpg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage
                    alt="Elli"
                    src="/Avatar.png"
                  />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs px-4 py-2 text-sm text-gray-700 rounded-lg ${
                  m.role === "user" ? "bg-gray-100" : "bg-[#E5EEFF]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-between p-1">
          <div className="flex items-center px-1 py-2 bg-white">
            <Input
              className="flex-grow w-full p-2 rounded shadow-sm"
              value={input}
              placeholder="How may I help you today?..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="rounded p-2 ml-1"
              disabled={isLoading}
            >
              <SendIcon className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-b-lg">
        <Link 
          href="https://api.whatsapp.com/send/?phone=233536620120&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          Continue to
          <Image
            src="/whatsapp.svg"
            alt="Continue to WhatsApp"
            width={100}
            height={100}
            className="hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>
    </div>
  );
}

function SendIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
    >
      <path d="M64 256c0 106 86 192 192 192s192-86 192-192S362 64 256 64 64 150 64 256z" />
      <path d="M216 352l96-96-96-96" />
    </svg>
  );
}