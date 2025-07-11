"use client";

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    InitChatWidget: (apiKey: string) => void;
  }
}

export const ChatWidget = () => {
  useEffect(() => {
    const initWidget = () => {
      window.InitChatWidget('HHF5Zo9vwFuMdHMaBwL1BK7Yvjyfu6hbrNsK5fWwkhBKZM2Dvu');
    };

    if (typeof window.InitChatWidget === 'function') {
      initWidget();
    } else {
      window.addEventListener('load', initWidget);
    }

    return () => {
      window.removeEventListener('load', initWidget);
    };
  }, []);

  return (
    <>
      <Script
        src="https://backend.intelliconcierge.com/widgets/cdn/loader.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.InitChatWidget('HHF5Zo9vwFuMdHMaBwL1BK7Yvjyfu6hbrNsK5fWwkhBKZM2Dvu');
        }}
      />
    </>
  );
}; 