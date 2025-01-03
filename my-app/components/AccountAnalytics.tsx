'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from 'lucide-react'

interface ChannelMetrics {
  channel: string
  conversations: number
  humanTakeovers: number
  followUps: number
  salesClosed: number
  avgResponseTime: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

interface AnalyticsData {
  overview: {
    totalConversations: number
    totalHumanTakeovers: number
    averageResponseTime: number
    totalSalesClosed: number
    conversionRate: number
  }
  channelMetrics: ChannelMetrics[]
  timeSeriesData: Array<{
    date: string
    conversations: number
    responses: number
    takeovers: number
  }>
}

// Mock data structure
const mockData: AnalyticsData = {
  overview: {
    totalConversations: 1250,
    totalHumanTakeovers: 125,
    averageResponseTime: 3.5,
    totalSalesClosed: 45,
    conversionRate: 3.6
  },
  channelMetrics: [
    {
      channel: 'WhatsApp',
      conversations: 500,
      humanTakeovers: 50,
      followUps: 75,
      salesClosed: 20,
      avgResponseTime: 2.8,
      sentiment: { positive: 65, neutral: 25, negative: 10 }
    },
    {
      channel: 'Website',
      conversations: 350,
      humanTakeovers: 35,
      followUps: 45,
      salesClosed: 15,
      avgResponseTime: 3.2,
      sentiment: { positive: 70, neutral: 20, negative: 10 }
    },
    {
      channel: 'Instagram',
      conversations: 250,
      humanTakeovers: 25,
      followUps: 30,
      salesClosed: 8,
      avgResponseTime: 4.1,
      sentiment: { positive: 55, neutral: 35, negative: 10 }
    },
    {
      channel: 'Facebook',
      conversations: 150,
      humanTakeovers: 15,
      followUps: 25,
      salesClosed: 2,
      avgResponseTime: 3.8,
      sentiment: { positive: 60, neutral: 30, negative: 10 }
    }
  ],
  timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    conversations: Math.floor(Math.random() * 100),
    responses: Math.floor(Math.random() * 200),
    takeovers: Math.floor(Math.random() * 20)
  }))
}

export default function AccountAnalytics() {
  const [period, setPeriod] = useState('daily')
  const [showSentiment, setShowSentiment] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSentiment(!showSentiment)}
        >
          {showSentiment ? 'Hide' : 'Show'} Sentiment Analysis
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Conversations"
          value={mockData.overview.totalConversations}
          change="+12.3%"
          trend="up"
        />
        <MetricCard
          title="Human Takeovers"
          value={mockData.overview.totalHumanTakeovers}
          change="-5.2%"
          trend="down"
        />
        <MetricCard
          title="Sales Closed"
          value={mockData.overview.totalSalesClosed}
          change="+8.1%"
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${mockData.overview.conversionRate}%`}
          change="+1.2%"
          trend="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={mockData.timeSeriesData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="conversations" stroke="#8884d8" name="Conversations" />
              <Line type="monotone" dataKey="responses" stroke="#82ca9d" name="Responses" />
              <Line type="monotone" dataKey="takeovers" stroke="#ffc658" name="Takeovers" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {showSentiment && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis by Channel</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mockData.channelMetrics}>
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sentiment.positive" stackId="sentiment" fill="#4ade80" name="Positive" />
                <Bar dataKey="sentiment.neutral" stackId="sentiment" fill="#facc15" name="Neutral" />
                <Bar dataKey="sentiment.negative" stackId="sentiment" fill="#f87171" name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockData.channelMetrics.map((channel) => (
              <div key={channel.channel} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{channel.channel}</p>
                  <p className="text-2xl font-bold">{channel.conversations}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Takeovers</p>
                  <p className="text-2xl font-bold">{channel.humanTakeovers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
                  <p className="text-2xl font-bold">{channel.followUps}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sales</p>
                  <p className="text-2xl font-bold">{channel.salesClosed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{channel.avgResponseTime}m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
                  <p className="text-2xl font-bold">{channel.sentiment.positive}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, change, trend }: { 
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === 'up' ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : trend === 'down' ? (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        ) : (
          <ArrowRightIcon className="h-4 w-4 text-yellow-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${
          trend === 'up' 
            ? 'text-green-500' 
            : trend === 'down' 
            ? 'text-red-500' 
            : 'text-yellow-500'
        }`}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

