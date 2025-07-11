'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface PlatformData {
  platform: string
  conversations: number
  resolutionTime: number
  apiUsage: number
}

interface AnalyticsData {
  totalConversations: number
  averageResolutionTime: number
  totalApiUsage: number
  platformData: PlatformData[]
}

const mockData: AnalyticsData = {
  totalConversations: 1250,
  averageResolutionTime: 3.5,
  totalApiUsage: 15000,
  platformData: [
    { platform: 'Website', conversations: 500, resolutionTime: 3.2, apiUsage: 6000 },
    { platform: 'WhatsApp', conversations: 350, resolutionTime: 4.1, apiUsage: 4200 },
    { platform: 'Facebook', conversations: 250, resolutionTime: 3.8, apiUsage: 3000 },
    { platform: 'Instagram', conversations: 150, resolutionTime: 2.9, apiUsage: 1800 },
  ]
}

export default function AccountAnalytics() {
  // In a real application, you would fetch this data from an API
  const data = mockData

  if (!data || data.platformData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Analytics</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageResolutionTime} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalApiUsage}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Comparison</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.platformData}>
              <XAxis dataKey="platform" />
              <YAxis />
              <Bar dataKey="conversations" fill="#8884d8" name="Conversations" />
              <Bar dataKey="apiUsage" fill="#82ca9d" name="API Usage" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
