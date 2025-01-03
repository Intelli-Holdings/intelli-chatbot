'use client'

import React from 'react'
import { DatePickerWithRange } from '@/components/date-range-picker'
import AccountAnalytics from '@/components/AccountAnalytics'
import { StatsOverview } from '@/components/dash-components/stats'
import { DateRangeProvider } from '@/contexts/DateRangeContext'

export default function AnalyticsPage() {
  return (
    <DateRangeProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Detailed metrics and insights across all your communication channels
              </p>
            </div>
            <DatePickerWithRange />
          </div>
          <StatsOverview />
          <AccountAnalytics />
        </div>
      </div>
    </DateRangeProvider>
  )
}