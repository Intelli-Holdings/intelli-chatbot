"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import Image from 'next/image';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div
      className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between p-4 bg-[#007FFF] text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              alt="Ellie's avatar"
              src="/Ellis.png?height=80&width=80"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-xs font-semibold">Elli</p>
          </div>
        </div>
      </div>
      <div className="justify-between p-1">
        <ScrollArea className="h-[calc(60vh-100px)]">
          <div>
            <Card className="shadow-lg border-none">
              <CardContent>
                <CardHeader>
                  <CardTitle>Welcome to Elli</CardTitle>
                  <CardDescription>
                    Elli is an AI assistant that can be trained to
                    answer inquiries about your business to your customers.
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
                  <AvatarImage alt="User" src="/user.jpg?height=30&width=30" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage
                    alt="Elli"
                    src="/Avatar.png?height=50&width=50"
                  />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs px-4 py-2 text-sm text-gray-700 rounded-lg bg-[E5EEFF] text-gray p-3 rounded-lg ${
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
              onChange={handleInputChange}
            />
            <Button type="submit" className="rounded p-2 ml-1">
              <SendIcon className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-b-lg">
      <Link 
  href="https://api.whatsapp.com/send/?phone=233553221408&text&type=phone_number&app_absent=0"
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

function CrossIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill=""
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
