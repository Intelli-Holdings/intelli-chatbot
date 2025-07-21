"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { MessageSquare, AlertTriangle, Clock, Smartphone, Globe, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import useActiveOrganizationId from "@/hooks/use-organization-id"

interface MetricData {
  id: number
  free_token: number
  used_token: number
  payed_token: number
  total_token: number
  remaining_token: number
  num_conversations: number
  num_messages: number
  num_escalations: number
  num_pending: number
  num_assigned: number
  num_resolved: number
  conversations_per_channel: {
    channels: {
      website: {
        number_of_app: number
        number_of_messages: number
        number_of_escalations: {
          total: number
          default: number
          pending: number
          assigned: number
          resolved: number
          average_duration: number
        }
        number_of_conversations: number
      }
      whatsapp: {
        number_of_app: number
        number_of_messages: number
        number_of_escalations: {
          total: number
          default: number
          pending: number
          assigned: number
          resolved: number
          average_duration: number
        }
        number_of_conversations: number
      }
    }
    notifications: {
      pending: number
      assigned: number
      resolved: number
      escalation: number
      average_duration: number
    }
  }
  created_at: string
  updated_at: string
  organization: string
}

export default function AccountAnalytics() {
  const [data, setData] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orgId = useActiveOrganizationId()

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!orgId) return; // Don't fetch if no orgId yet
      
      try {
        const response = await fetch(`/api/analytics/${orgId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch metrics")
        }
        const metrics = await response.json()
        setData(metrics)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [orgId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Error loading analytics: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No analytics data available.</p>
        </CardContent>
      </Card>
    )
  }

  const latestData = data[data.length - 1]
  const tokenUsagePercent = (latestData.used_token / latestData.total_token) * 100

  // Prepare chart data
  const timeSeriesData = data.map((item) => ({
    date: format(new Date(item.created_at), "MMM dd HH:mm"),
    conversations: item.num_conversations,
    messages: item.num_messages,
    escalations: item.num_escalations,
    pending: item.num_pending,
    assigned: item.num_assigned,
    resolved: item.num_resolved,
    tokenUsage: (item.used_token / item.total_token) * 100,
  }))

  const channelData = [
    {
      name: "Website",
      conversations: latestData.conversations_per_channel.channels.website.number_of_conversations,
      messages: latestData.conversations_per_channel.channels.website.number_of_messages,
      escalations: latestData.conversations_per_channel.channels.website.number_of_escalations.total,
      color: "#8b5cf6",
    },
    {
      name: "WhatsApp",
      conversations: latestData.conversations_per_channel.channels.whatsapp.number_of_conversations,
      messages: latestData.conversations_per_channel.channels.whatsapp.number_of_messages,
      escalations: latestData.conversations_per_channel.channels.whatsapp.number_of_escalations.total,
      color: "#10b981",
    },
  ]

  const escalationStatusData = [
    { name: "Pending", value: latestData.num_pending, color: "#f59e0b" },
    { name: "Assigned", value: latestData.num_assigned, color: "#3b82f6" },
    { name: "Resolved", value: latestData.num_resolved, color: "#10b981" },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(latestData.used_token / 1000).toFixed(0)}K</div>
            <Progress value={tokenUsagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {latestData.remaining_token.toLocaleString()} tokens remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestData.num_conversations}</div>
            <p className="text-xs text-muted-foreground">{latestData.num_messages} total messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestData.num_pending}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {latestData.num_assigned} assigned
              </Badge>
              <Badge variant="outline" className="text-xs">
                {latestData.num_resolved} resolved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestData.conversations_per_channel.notifications.average_duration.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">Average escalation duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    tokenUsage: {
                      label: "Token Usage %",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="tokenUsage"
                      stroke="var(--color-tokenUsage)"
                      fill="var(--color-tokenUsage)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversations & Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    conversations: {
                      label: "Conversations",
                      color: "hsl(var(--chart-2))",
                    },
                    messages: {
                      label: "Messages",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="conversations" stroke="var(--color-conversations)" strokeWidth={2} />
                    <Line type="monotone" dataKey="messages" stroke="var(--color-messages)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Conversations and messages by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel) => (
                    <div key={channel.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {channel.name === "Website" ? (
                          <Globe className="h-5 w-5 text-purple-500" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{channel.name}</p>
                          <p className="text-sm text-muted-foreground">{channel.conversations} conversations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{channel.messages}</p>
                        <p className="text-sm text-muted-foreground">messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    conversations: {
                      label: "Conversations",
                    },
                  }}
                  className="h-[200px]"
                >
                  <PieChart>
                    <Pie data={channelData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="conversations">
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escalations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Escalation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Count",
                    },
                  }}
                  className="h-[200px]"
                >
                  <PieChart>
                    <Pie
                      data={escalationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {escalationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pending: {
                      label: "Pending",
                      color: "hsl(var(--chart-4))",
                    },
                    assigned: {
                      label: "Assigned",
                      color: "hsl(var(--chart-5))",
                    },
                    resolved: {
                      label: "Resolved",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pending" fill="var(--color-pending)" />
                    <Bar dataKey="assigned" fill="var(--color-assigned)" />
                    <Bar dataKey="resolved" fill="var(--color-resolved)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Metrics Trend</CardTitle>
              <CardDescription>Complete overview of all metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  conversations: {
                    label: "Conversations",
                    color: "#8b5cf6", // Purple
                  },
                  messages: {
                    label: "Messages",
                    color: "#10b981", // Green
                  },
                  escalations: {
                    label: "Escalations",
                    color: "#f59e0b", // Amber
                  },
                  pending: {
                    label: "Pending",
                    color: "#ef4444", // Red
                  },
                  assigned: {
                    label: "Assigned",
                    color: "#3b82f6", // Blue
                  },
                  resolved: {
                    label: "Resolved",
                    color: "#06b6d4", // Cyan
                  },
                }}
                className="h-[400px]"
              >
                <AreaChart
                  accessibilityLayer
                  data={timeSeriesData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(' ')[0]} // Show only date part
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="conversations"
                    type="natural"
                    fill="var(--color-conversations)"
                    fillOpacity={0.4}
                    stroke="var(--color-conversations)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="messages"
                    type="natural"
                    fill="var(--color-messages)"
                    fillOpacity={0.4}
                    stroke="var(--color-messages)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="escalations"
                    type="natural"
                    fill="var(--color-escalations)"
                    fillOpacity={0.4}
                    stroke="var(--color-escalations)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="pending"
                    type="natural"
                    fill="var(--color-pending)"
                    fillOpacity={0.4}
                    stroke="var(--color-pending)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="assigned"
                    type="natural"
                    fill="var(--color-assigned)"
                    fillOpacity={0.4}
                    stroke="var(--color-assigned)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="resolved"
                    type="natural"
                    fill="var(--color-resolved)"
                    fillOpacity={0.4}
                    stroke="var(--color-resolved)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
