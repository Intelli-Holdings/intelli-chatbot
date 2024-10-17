import React from 'react';
import { Metadata } from 'next';
import Assistants from '@/components/Assistants';

export const metadata: Metadata = {
  title: 'Assistants | Dashboard',
  description: 'Manage your AI assistants',
};

export default function AssistantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Assistants</h1>
      <Assistants />
    </div>
  );
}
