"use client"

import React, { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Users,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { getMetricsSummaryByOrganization, getMetricsByOrganization, type MetricsResponse, type MetricsSnapshot } from "@/lib/metrics-service"
import Image from "next/image"

const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  subtitle: string
  icon: React.ElementType
  color: string
  trend?: "up" | "down" | "neutral"
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, subtitle, icon: Icon, color, trend }) => (
  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: color }}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {change !== undefined && (
          <Badge variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"} className="flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </Badge>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
)

interface ChannelCardProps {
  name: string
  conversations: number
  messages: number
  escalations: number
  avgResolution: number
  icon: string | React.ReactNode
  color: string
}

const ChannelCard: React.FC<ChannelCardProps> = ({ name, conversations, messages, escalations, avgResolution, icon, color }) => (
  <Card className="hover:shadow-md transition-all duration-300">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          {typeof icon === "string" ? <span className="text-2xl">{icon}</span> : icon}
          {name}
        </CardTitle>
        <Badge style={{ backgroundColor: `${color}20`, color }}>{conversations} conversations</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Messages</p>
          <p className="text-2xl font-bold">{messages.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Escalations</p>
          <p className="text-2xl font-bold">{escalations}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Resolution</p>
          <p className="text-2xl font-bold">{Math.floor(avgResolution / 60)} min</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function Analytics() {
  const organizationId = useActiveOrganizationId()
  const [timeRange, setTimeRange] = useState<string>("30")
  const [metricsData, setMetricsData] = useState<MetricsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!organizationId) return

      try {
        setIsLoading(true)

        // Fetch summary data (includes timeline)
        const summaryData = await getMetricsSummaryByOrganization(organizationId, { period: timeRange })
        setMetricsData(summaryData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [organizationId, timeRange])

  if (!organizationId || isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!metricsData || !metricsData.summary || !metricsData.latest) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center space-y-4">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
            <p className="text-sm text-muted-foreground">Continue using Intelli to see your analytics</p>
          </div>
        </div>
      </div>
    )
  }

  const { summary, latest } = metricsData

  // Calculate trends
  const totalEscalations = (summary.total_pending || 0) + (summary.total_assigned || 0) + (summary.total_resolved || 0)
  const resolutionRate = totalEscalations > 0 ? ((summary.total_resolved || 0) / totalEscalations) * 100 : 0

  // Prepare escalation distribution data
  const escalationData = [
    { name: "Pending", value: summary.total_pending || 0, color: CHART_COLORS.warning },
    { name: "Assigned", value: summary.total_assigned || 0, color: CHART_COLORS.primary },
    { name: "Resolved", value: summary.total_resolved || 0, color: CHART_COLORS.success },
  ]

  // Prepare channel data
  const channelData = [
    {
      name: "Website",
      conversations: latest.conversations_per_channel?.channels?.website?.number_of_conversations || 0,
      messages: latest.conversations_per_channel?.channels?.website?.number_of_messages || 0,
      escalations: latest.conversations_per_channel?.channels?.website?.number_of_escalations?.total || 0,
      avgResolution: latest.conversations_per_channel?.channels?.website?.number_of_escalations?.average_duration || 0,
      icon: "🌐",
      color: CHART_COLORS.primary,
    },
    {
      name: "WhatsApp",
      conversations: latest.conversations_per_channel?.channels?.whatsapp?.number_of_conversations || 0,
      messages: latest.conversations_per_channel?.channels?.whatsapp?.number_of_messages || 0,
      escalations: latest.conversations_per_channel?.channels?.whatsapp?.number_of_escalations?.total || 0,
      avgResolution: latest.conversations_per_channel?.channels?.whatsapp?.number_of_escalations?.average_duration || 0,
      icon: (
        <Image
          src="/whatsapp.png"
          alt="WhatsApp"
          width={20}
          height={20}
          className="object-contain"
        />
      ),
      color: CHART_COLORS.success,
    },
  ]

  // Prepare conversations over time data
  const timelineData = metricsData?.timeline || []
  const conversationsOverTime = timelineData.map((snapshot) => ({
    date: new Date(snapshot.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    whatsapp: snapshot.conversations_per_channel?.channels?.whatsapp?.number_of_conversations || 0,
    website: snapshot.conversations_per_channel?.channels?.website?.number_of_conversations || 0,
    total: snapshot.num_conversations || 0,
  }))

  const messagesOverTime = timelineData.map((snapshot) => ({
    date: new Date(snapshot.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    messages: snapshot.num_messages || 0,
    escalations: snapshot.num_escalations || 0,
  }))

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector - Floating */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Overview</h2>
          <p className="text-muted-foreground">Real-time insights into your operations</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="AI Token Usage"
          value={formatNumber(summary.total_tokens_used || 0)}
          change={(summary.avg_tokens_remaining || 0) > 0 ? 12.5 : 0}
          subtitle={`${formatNumber(Math.round(summary.avg_tokens_remaining || 0))} remaining`}
          icon={Zap}
          color={CHART_COLORS.cyan}
          trend="up"
        />
        <MetricCard
          title="Total Conversations"
          value={formatNumber(summary.total_conversations || 0)}
          change={8.3}
          subtitle={`${formatNumber(summary.total_messages || 0)} messages`}
          icon={MessageSquare}
          color={CHART_COLORS.purple}
          trend="up"
        />
        <MetricCard
          title="Resolution Rate"
          value={`${resolutionRate.toFixed(1)}%`}
          change={resolutionRate}
          subtitle={`${summary.total_resolved || 0} resolved`}
          icon={CheckCircle}
          color={CHART_COLORS.success}
          trend={resolutionRate > 50 ? "up" : "down"}
        />
        <MetricCard
          title="Pending Issues"
          value={summary.total_pending || 0}
          change={-5.2}
          subtitle={`${summary.total_assigned || 0} assigned`}
          icon={Clock}
          color={CHART_COLORS.warning}
          trend="down"
        />
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalation Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Status</CardTitle>
                <CardDescription>Distribution of current escalations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={escalationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {escalationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {escalationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversations Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation Trends</CardTitle>
                <CardDescription>Track conversation volume across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={conversationsOverTime}>
                    <defs>
                      <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorWebsite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="whatsapp"
                      stroke={CHART_COLORS.success}
                      fillOpacity={1}
                      fill="url(#colorWhatsapp)"
                      strokeWidth={2}
                      name="WhatsApp"
                    />
                    <Area
                      type="monotone"
                      dataKey="website"
                      stroke={CHART_COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorWebsite)"
                      strokeWidth={2}
                      name="Website"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          {/* Channel Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {channelData.map((channel) => (
              <ChannelCard key={channel.name} {...channel} />
            ))}
          </div>

          {/* Channel Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversations by Channel</CardTitle>
                <CardDescription>Compare conversation volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="conversations" fill={CHART_COLORS.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>Total messages per channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="messages" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message & Escalation Trends</CardTitle>
              <CardDescription>Monitor activity patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={messagesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Messages"
                  />
                  <Line
                    type="monotone"
                    dataKey="escalations"
                    stroke={CHART_COLORS.warning}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.warning, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Escalations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resolution Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Performance</CardTitle>
              <CardDescription>Average resolution time by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#888" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${Math.floor(value / 60)} min`, "Avg Resolution"]}
                  />
                  <Bar dataKey="avgResolution" fill={CHART_COLORS.purple} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
