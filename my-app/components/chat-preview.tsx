"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/chat-window";
interface ChatIconProps {
  onClick: () => void;
  isOpen: boolean;
}

// Icon component
const ChatIcon: React.FC<ChatIconProps> = ({ onClick, isOpen }) => (
  <div
    className="fixed bottom-20 right-5 z-20 p-4 bg-blue-200 rounded-full cursor-pointer"
    onClick={onClick}
  >
    {isOpen ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="#007fff"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="#007fff"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    )}
  </div>
);

export function ChatPreview() {
  const [chatWindowOpen, setChatWindowOpen] = useState(false);

  const toggleChatWindow = () => {
    setChatWindowOpen((prevState) => !prevState);
  };

  return (
    <div className="relative h-screen">
      <iframe
        id="websiteFrame"
        className="absolute inset-0 w-full h-full z-0"
        title="Website Preview"
      ></iframe>

      <ChatIcon onClick={toggleChatWindow} isOpen={chatWindowOpen} />

      {chatWindowOpen && (
        <div
          className="fixed bottom-36 right-5 rounded-xl shadow-sm"
        >
          <ChatWindow/>
        </div>
      )}
    </div>
  );
}