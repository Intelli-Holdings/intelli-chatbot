"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ArrowUp, XIcon } from "lucide-react";
import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastActionElement, ToastClose } from "@/components/ui/toast";

export function ChatWindow() {
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  const handleCloseAlert = () => {
    setIsAlertVisible(false);
  };

  
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hello! I'm Elli, Ask me anything about Intelli?" }
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
    <div className="flex flex-col max-w-[400px] mx-auto border bg-white rounded-xl">
      <div className="flex items-center justify-between p-4 bg-[#007FFF] text-white rounded-t-lg">
        <div className="flex items-center space-x2 border-none">
          <Avatar>
            <AvatarImage
              alt="Ellie's avatar"
              src="/Ellis.png"
            />
            <AvatarFallback>E</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-2xl font-regular p-2">Elli</p>
          </div>
        </div>
      </div>

      <div className="justify-between">
        <ScrollArea className="h-[calc(60vh-100px)]">
          <div className="px-1 py-2">            
          {isAlertVisible && (
        <Alert className="relative px-1 py-2 shadow-sm border-blue-200">
          <button
            onClick={handleCloseAlert}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close alert"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <AlertDescription>
            <CardHeader>
              <AlertTitle>Welcome to Elli</AlertTitle>
              <CardDescription>
                Elli is an AI assistant that has been trained to
                answer questions about Intelli.
                Please review the Intelli <Link href="/privacy" text-color="green">Privacy Statement</Link> to understand how we process your information.
              </CardDescription>
            </CardHeader>
          </AlertDescription>
        </Alert>
      )}
          </div>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${
                m.role === "user" ? "flex items-end justify-start space-x-20" : "flex items-start justify-end space-x-2"
              } px-4 py-1 space-y-2`}
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
                className={`max-w-sm px-2 p-1 text-sm border shadow-sm ${
                  m.role === "user" ? "rounded-l-lg rounded-t-xl text-white bg-blue-500 border-blue-200 " : "rounded-r-lg rounded-b-xl text-black bg-[#F2F2F2] border-gray-200"
                }`}
              >
                
                {m.content}
              </div>
            </div>
          ))}
       </ScrollArea>
      

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-between ">
          <div className="flex items-center m-1 px-1 p-1 rounded-xl border shadow-sm">
            <Input
              className="flex-grow w-full border-none rounded-lg m-1 p-2"
              value={input}
              placeholder="Chat with Elli."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}

            />
            <Button 
              type="submit" 
              className=" bg-[#007fff] hover:bg-blue-600 rounded-lg m-1 p-2"
              disabled={isLoading}
            >
              <ArrowUp className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </form>
      
      </div>

      <div className="items-center p-2 m-1 bg-green-200 rounded-lg shadow-sm border border-green-400 hover:border-green-500">
        <Link 
          href="https://api.whatsapp.com/send/?phone=254769758405&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
         
          <Image
            src="/whatsapp.svg"
            alt="Continue to WhatsApp"
            width={80}
            height={80}
            className="hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>
    </div>
  );
}