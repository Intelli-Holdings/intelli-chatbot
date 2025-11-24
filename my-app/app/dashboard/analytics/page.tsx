"use client"

import { useState } from "react"
import Analytics from "@/components/Analytics"
import { Button } from "@/components/ui/button"
import { produceMetricsSnapshot } from "@/lib/metrics-service"
import useActiveOrganizationId from "@/hooks/use-organization-id"

export default function AnalyticsPage() {
  const organizationId = useActiveOrganizationId()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState(false)

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
      console.error("Error producing snapshot:", error)
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor your metrics and performance across all platforms</p>
          </div>
          <Button onClick={handleProduceSnapshot} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "View Latest"}
          </Button>
        </div>

        {/* Success Message */}
        {refreshSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            Analytics refreshed!
          </div>
        )}

        {/* Analytics Component */}
        <Analytics />
      </div>
    </div>
  )
}
