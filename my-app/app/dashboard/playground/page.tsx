import React from 'react';
import { Metadata } from 'next';
import Playground from '@/components/Playground';

export const metadata: Metadata = {
  title: 'Playground | Dashboard',
  description: 'Test and Edit your AI assistants',
};

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Playground</h1>
      <Playground />
    </div>
  );
}
