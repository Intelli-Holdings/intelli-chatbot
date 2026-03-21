"use client";

import { useState, useEffect } from "react";

const channels = [
  "WhatsApp",
  "Instagram",
  "Messenger",
  "Email",
  "your Website",
  "SMS",
];

export function ChannelCycler() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % channels.length);
        setIsVisible(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block bg-gradient-to-r from-dreamBlue to-cyan-400 bg-clip-text text-transparent transition-all duration-400 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }`}
    >
      {channels[currentIndex]}
    </span>
  );
}
