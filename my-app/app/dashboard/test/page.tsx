"use client"
import React from 'react';
import { Metadata } from 'next';
import AccountAnalytics from '@/components/AccountAnalytics';
import { StatsOverview } from '@/components/dash-components/stats';
import Analytics from '@/components/Analytics';


export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Analytics</h1>
      <Analytics />
    </div>
  );
}
