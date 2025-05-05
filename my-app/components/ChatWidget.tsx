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
      window.InitChatWidget('CwFgU3IquiUpnlfiAs7FLxs8Qumx8c0dy2Nr1ZXsMmh9WzdzfQ');
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
        src="https://intelliholdings-backend.onrender.com/widgets/cdn/loader.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.InitChatWidget('CwFgU3IquiUpnlfiAs7FLxs8Qumx8c0dy2Nr1ZXsMmh9WzdzfQ');
        }}
      />
    </>
  );
}; 