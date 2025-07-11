import React from 'react';
import { Metadata } from 'next';
import Playground from '@/components/Playground';
import { ChatWindow } from '@/components/chat-window';
import Workground from '@/components/Workground';

export const metadata: Metadata = {
  title: 'Playground | Dashboard',
  description: 'Customise and Deploy your Website Widget',
};

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Playground</h1>
      <Workground />
    </div>
  );
}
