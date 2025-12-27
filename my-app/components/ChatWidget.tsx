"use client";

import Script from 'next/script';

declare global {
  interface Window {
    InitChatWidget: (apiKey: string) => void;
  }
}

export const ChatWidget = () => {
  return (
    <>
      <Script
        src="https://backend.intelliconcierge.com/widgets/cdn/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window.InitChatWidget === 'function') {
            window.InitChatWidget('HHF5Zo9vwFuMdHMaBwL1BK7Yvjyfu6hbrNsK5fWwkhBKZM2Dvu');
          }
        }}
        onError={(e) => {
          console.error('Failed to load chat widget script:', e);
        }}
      />
    </>
  );
}; 