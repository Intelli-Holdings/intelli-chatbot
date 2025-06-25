"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, DollarSign, MessageSquare, Users, TrendingUp, Clock } from "lucide-react"

interface InsightData {
  escalations: {
    count: number
    recent: Array<{ id: string; message: string; time: string; severity: "high" | "medium" | "low" }>
  }
  tokenUsage: {
    current: number
    limit: number
    cost: number
    trend: number
  }
  conversations: {
    total: number
    active: number
    avgResponseTime: string
    satisfaction: number
  }
  contacts: {
    total: number
    inbound: number
    followUpNeeded: number
    converted: number
  }
}

const InsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<InsightData>({
    escalations: {
      count: 3,
      recent: [
        { id: "1", message: "Customer complaint about delayed delivery", time: "2 min ago", severity: "high" },
        { id: "2", message: "Billing inquiry requires manual review", time: "15 min ago", severity: "medium" },
        { id: "3", message: "Product return request escalated", time: "1 hour ago", severity: "low" },
      ],
    },
    tokenUsage: {
      current: 1250,
      limit: 2000,
      cost: 18.75,
      trend: 12,
    },
    conversations: {
      total: 156,
      active: 23,
      avgResponseTime: "2.3 min",
      satisfaction: 4.2,
    },
    contacts: {
      total: 89,
      inbound: 34,
      followUpNeeded: 12,
      converted: 7,
    },
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setInsights((prev) => ({
        ...prev,
        escalations: {
          ...prev.escalations,
          count: prev.escalations.count + Math.floor(Math.random() * 2),
        },
        tokenUsage: {
          ...prev.tokenUsage,
          current: prev.tokenUsage.current + Math.floor(Math.random() * 10),
          cost: prev.tokenUsage.cost + Math.random() * 0.5,
        },
        conversations: {
          ...prev.conversations,
          total: prev.conversations.total + Math.floor(Math.random() * 3),
          active: Math.max(1, prev.conversations.active + Math.floor(Math.random() * 4) - 2),
        },
        contacts: {
          ...prev.contacts,
          inbound: prev.contacts.inbound + Math.floor(Math.random() * 2),
          followUpNeeded: Math.max(0, prev.contacts.followUpNeeded + Math.floor(Math.random() * 3) - 1),
        },
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Insights</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updates every 30s</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Contacts - Wide card (3 columns md, 6 columns lg) */}
        <Card className="md:col-span-3 lg:col-span-6 border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              Contact Management
            </CardTitle>
            <CardDescription>Lead tracking and follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-gray-900">{insights.contacts.total}</p>
                <p className="text-sm text-gray-500">Total Contacts</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-blue-600">{insights.contacts.inbound}</p>
                <p className="text-sm text-gray-500">Inbound Leads</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-orange-600">{insights.contacts.followUpNeeded}</p>
                <p className="text-sm text-gray-500">Need Follow-up</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-green-600">{insights.contacts.converted}</p>
                <p className="text-sm text-gray-500">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Notifications - Large card (3 columns on lg, 2 on md) */}
        <Card className="md:col-span-2 lg:col-span-2 lg:row-span-2 border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Escalation Alerts
              </CardTitle>
              <Badge variant="destructive">{insights.escalations.count}</Badge>
            </div>
            <CardDescription>Messages that triggered escalations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-30">
              <div className="space-y-3 pr-4">
                {insights.escalations.recent.slice(0, 3).map((escalation) => (
                  <div key={escalation.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <Badge className={getSeverityColor(escalation.severity)} variant="outline">
                      {escalation.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{escalation.message}</p>
                      <p className="text-xs text-gray-500">{escalation.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Token Usage - Medium card (1 column md, 2 columns lg) */}
        <Card className="md:col-span-1 lg:col-span-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Token Usage
            </CardTitle>
            <CardDescription>Meta API consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used: {insights.tokenUsage.current}</span>
                <span>Limit: {insights.tokenUsage.limit}</span>
              </div>
              <Progress value={(insights.tokenUsage.current / insights.tokenUsage.limit) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${insights.tokenUsage.cost.toFixed(2)}</span>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+{insights.tokenUsage.trend}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations - Small card (1 column) */}
        <Card className="md:col-span-1 lg:col-span-2 border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Conversations
            </CardTitle>
            <CardDescription>Customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-bold text-lg">{insights.conversations.total}</p>
                </div>
                <div>
                  <p className="text-gray-500">Active</p>
                  <p className="font-bold text-lg text-green-600">{insights.conversations.active}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Avg Response Time</p>
                <p className="font-semibold">{insights.conversations.avgResponseTime}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Satisfaction:</span>
                <Badge variant="secondary">{insights.conversations.satisfaction}/5.0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InsightsDashboard
