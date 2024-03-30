"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chat-window";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";

interface Props {}

export function ChatPreview() {
  const [chatbotVisible, setChatbotVisible] = useState(false);
  useEffect(() => {
    const loadScripts = async () => {
      const reactScript = document.createElement("script");
      reactScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js";
      document.body.appendChild(reactScript);

      const reactDOMScript = document.createElement("script");
      reactDOMScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js";
      document.body.appendChild(reactDOMScript);

      const chatWindowScript = document.createElement("script");
      chatWindowScript.src = "@/public/components/chat-window.tsx"; // Replace with the actual path
      document.body.appendChild(chatWindowScript);
    };

    loadScripts();

    return () => {};
  }, []);

  const renderWebsite = () => {
    const url = (document.getElementById("url") as HTMLInputElement).value;
    (document.getElementById("websiteFrame") as HTMLIFrameElement).src = url;
  };

  const toggleChatbot = () => {
    setChatbotVisible((prevVisible) => !prevVisible);
  };

  return (
    <div className="relative h-screen">
      <iframe
        id="websiteFrame"
        className="absolute inset-0 w-full h-full z-0"
        title="Website Preview"
      ></iframe>
      {chatbotVisible && (
        <div 
        className="fixed bottom-10 right-0 z-10 p-4">
          {/* Your chatbot component */}
          <div className="bg-white rounded-lg shadow-md p-4" >
            {/* Content of your chatbot */}
            <button onClick={toggleChatbot}>Open Elli</button>
          </div>
        </div>
      )}
      <div className="pt-10 bg-white/50 backdrop-blur-md shadow-sm p-4 md:p-8 lg:p-12">
     
      <div className="pt-1 md:flex items-center space-x-2">    
      <Input type="text" id="url" placeholder="Enter your website URL starting with https://" />        
      <Button onClick={renderWebsite} className="pt-2 bg-blue-600 text-white"> Preview Website </Button>
      <Button className="pt-2 bg-gray-400 text-white" >
        <a href="/">
        Back to Home
          </a>  </Button>
      </div>
      </div>
      {!chatbotVisible && (
        <div 
        style={{ width: "380px", height: "600px" }}
        className="fixed bottom-10 right-0 z-20 p-4">
          <ChatWindow />
          <button onClick={toggleChatbot}>Close Elli</button>
        </div>
      )}
    </div>
  );
}
