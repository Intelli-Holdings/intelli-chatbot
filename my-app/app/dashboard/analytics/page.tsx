"use client"

import { useState, useRef, useEffect } from "react"
import Analytics from "@/components/Analytics"
import { Button } from "@/components/ui/button"
import { produceMetricsSnapshot } from "@/lib/metrics-service"
import { logger } from "@/lib/logger"
import useActiveOrganizationId from "@/hooks/use-organization-id"

// Import new advanced analytics components
import { TimeGranularitySelector } from "@/components/analytics/time-granularity-selector"
import { RealTimeMetricsCard } from "@/components/analytics/real-time-metrics-card"
import { CostBreakdownChart } from "@/components/analytics/cost-breakdown-chart"
import { ChannelComparisonChart } from "@/components/analytics/channel-comparison-chart"
import { TrendAnalysisChart } from "@/components/analytics/trend-analysis-chart"
import { CustomerInsightsPanel } from "@/components/analytics/customer-insights-panel"

import type { TimeGranularity } from "@/types/analytics"

export default function AnalyticsPage() {
  const organizationId = useActiveOrganizationId()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('hourly')
  const [showLegacy, setShowLegacy] = useState(false)
  const legacyRef = useRef<HTMLDivElement>(null)

  // Scroll to legacy section when it's shown
  useEffect(() => {
    if (showLegacy && legacyRef.current) {
      setTimeout(() => {
        legacyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showLegacy])

  const handleProduceSnapshot = async () => {
    if (!organizationId) return
    try {
      setIsRefreshing(true)
      setRefreshSuccess(false)
      await produceMetricsSnapshot(organizationId)
      setRefreshSuccess(true)
      setTimeout(() => setRefreshSuccess(false), 3000)
      window.location.reload()
    } catch (error) {
      logger.error("Error producing snapshot", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Loading Organization</h1>
            <p className="text-muted-foreground">Retrieving your organization information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time metrics, cost analysis, and customer insights</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TimeGranularitySelector
              value={timeGranularity}
              onChange={setTimeGranularity}
            />
            <Button
              variant="outline"
              onClick={() => setShowLegacy(!showLegacy)}
            >
              {showLegacy ? "Hide Legacy" : "Show Legacy"}
            </Button>
            <Button onClick={handleProduceSnapshot} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh Metrics"}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {refreshSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            ✓ Analytics refreshed successfully!
          </div>
        )}

        {/* Real-Time Metrics Section */}
        <div className="mb-6">
          <RealTimeMetricsCard organizationId={organizationId} />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Cost Breakdown */}
          <CostBreakdownChart organizationId={organizationId} />

          {/* Channel Comparison */}
          <ChannelComparisonChart organizationId={organizationId} />

          {/* Trend Analysis - Full Width */}
          <div className="lg:col-span-2">
            <TrendAnalysisChart
              organizationId={organizationId}
              granularity={timeGranularity}
            />
          </div>

          {/* Customer Insights - Full Width */}
          <div className="lg:col-span-2">
            <CustomerInsightsPanel organizationId={organizationId} />
          </div>
        </div>

        {/* Legacy Analytics Component (Optional) */}
        {showLegacy && (
          <div ref={legacyRef} className="mt-6 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Legacy Analytics</h2>
            <Analytics />
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">About These Metrics:</p>
          <ul className="space-y-1 text-xs">
            <li>• Real-time metrics update every minute</li>
            <li>• Hourly aggregation runs at :05 every hour</li>
            <li>• Daily aggregation runs at 00:10</li>
            <li>• Token costs are calculated using actual OpenAI API usage</li>
            <li>• All timestamps are in your local timezone</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
