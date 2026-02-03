"use client"

import { useEffect, useState } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMetricsByOrganization, type MetricsSnapshot } from "@/lib/metrics-service"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"

interface MetricsTimelineProps {
  organizationId: string
  timePeriod: "7d" | "30d" | "90d" | "year"
  onTimePeriodChange?: (period: "7d" | "30d" | "90d" | "year") => void
}

export function MetricsTimeline({ organizationId, timePeriod, onTimePeriodChange }: MetricsTimelineProps) {
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const params: any = { period: timePeriod.replace('d', '') }

        const data = await getMetricsByOrganization(organizationId, params)
        setSnapshots(data)
      } catch (err) {
        console.error("Error fetching metrics timeline:", err)
        setError("Failed to load metrics timeline")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [organizationId, timePeriod])

  // Transform data for chart
  const chartData = snapshots.map((snapshot) => ({
    timestamp: new Date(snapshot.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    conversations: snapshot.num_conversations,
    messages: snapshot.num_messages,
    escalations: snapshot.num_escalations,
    pending: snapshot.num_pending,
    resolved: snapshot.num_resolved,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Metrics Timeline</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {snapshots.length === 0
              ? "No data available for the selected period"
              : `Showing ${snapshots.length} metric snapshots`}
          </span>
          <span className="@[540px]/card:hidden">
            {snapshots.length} snapshots
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timePeriod}
            onValueChange={(value) => {
              if (value && onTimePeriodChange) {
                onTimePeriodChange(value as "7d" | "30d" | "90d" | "year")
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
            <ToggleGroupItem value="year">Last year</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timePeriod}
            onValueChange={(value) => {
              if (onTimePeriodChange) {
                onTimePeriodChange(value as "7d" | "30d" | "90d" | "year")
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 h-9 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="year" className="rounded-lg">
                Last year
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading && (
          <div className="h-80 flex items-center justify-center text-muted-foreground">Loading metrics data...</div>
        )}

        {error && (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">{error}</p>
              <p className="text-sm text-muted-foreground">
                Make sure you have metrics data available for this organization
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && snapshots.length > 0 && (
          <div className="aspect-auto h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillEscalations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  dataKey="conversations"
                  type="natural"
                  fill="url(#fillConversations)"
                  stroke="hsl(var(--chart-1))"
                  stackId="a"
                  name="Conversations"
                />
                <Area
                  dataKey="messages"
                  type="natural"
                  fill="url(#fillMessages)"
                  stroke="hsl(var(--chart-2))"
                  stackId="a"
                  name="Messages"
                />
                <Area
                  dataKey="escalations"
                  type="natural"
                  fill="url(#fillEscalations)"
                  stroke="hsl(var(--chart-3))"
                  stackId="a"
                  name="Escalations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {!isLoading && !error && snapshots.length === 0 && (
          <div className="h-80 flex items-center justify-center text-muted-foreground">No metrics data available</div>
        )}
      </CardContent>
    </Card>
  )
}
