"use client";

import { useRef, useState } from "react";
import { ChatWindow } from "@/components/chat-window";
import { Navbar } from "@/components/navbar";
//import { useNavigation } from "next-navigation"; // Correct import statement

export default function ChatWidget() {
  //const navigation = useNavigation(); // Correct usage of useNavigation
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialMessages = [
    {
      role: "user",
      content: "Hi, what is websitebot?",
    },
    {
      role: "bot",
      content:
        "WebsiteBot is a software application designed to perform automated tasks on websites.",
    },
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
    <ChatWindow />    
    </main>
    
  );
}
