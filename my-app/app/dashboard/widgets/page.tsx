import React from 'react';
import { Metadata } from 'next';
import UnifiedWidgets from '@/components/UnifiedWidgets';

export const metadata: Metadata = {
  title: 'Website Widgets | Dashboard',
  description: 'Create and manage your Website Widgets',
};

export default function WidgetsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Website Widgets</h1>
      <UnifiedWidgets />
    </div>
  );
}
