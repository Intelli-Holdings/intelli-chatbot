import React from 'react';
import { Metadata } from 'next';
import Playground from '@/components/Playground';

export const metadata: Metadata = {
  title: 'Playground | Dashboard',
  description: 'Test and Edit your AI assistants',
};

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Playground</h1>
      <Playground />
    </div>
  );
}
