import React from 'react';
import { Metadata } from 'next';
import AccountAnalytics from '@/components/AccountAnalytics';

export const metadata: Metadata = {
  title: 'Analytics | Dashboard',
  description: 'View analytics for all your AI assistants',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <AccountAnalytics />
    </div>
  );
}
