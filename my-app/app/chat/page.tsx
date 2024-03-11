"use client";

import { useRef, useState } from "react";
import { ChatWindow } from "@/components/chat-window";
import { Navbar } from "@/components/navbar";

export default function ChatWidget() {
  
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialMessages = [
    { role: "ai", content: "Hello, how can I help you today?" },
  ];
  const [messages, setMessages] = useState(initialMessages);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget.message.value;
    if (!message) {
      return;
    }

    setMessages([...messages, { role: "user", content: message }]);
    e.currentTarget.message.value = "";
    setTimeout(() => {
      if (scrollTargetRef.current)
        scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"> 
    <Navbar />    
    <ChatWindow/>   
    </main>
    
  );
}
