"use client";

import { ChatWindow } from "@/components/chat-window";
import { Navbar } from "@/components/navbar";

export default function ChatWidget() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"> 
      <Navbar />    
      <ChatWindow />   
    </main>
  );
}