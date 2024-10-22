"use client"
import React from 'react';
import { Metadata } from 'next';
import AccountAnalytics from '@/components/AccountAnalytics';
import { StatsOverview } from '@/components/dash-components/stats';


export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <StatsOverview />
    </div>
  );
}
