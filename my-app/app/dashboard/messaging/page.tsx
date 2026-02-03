"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, CheckCircle2, Clock, FileText, Zap } from "lucide-react"
import Link from "next/link"

export default function MessagingDashboard() {
  const router = useRouter()

  // Mock stats - will be replaced with real API calls
  const stats = {
    active: 12,
    scheduled: 5,
    drafts: 3,
    sentThisMonth: 2145,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
          <p className="text-muted-foreground">
            Manage your campaigns, send messages, and organize templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/messaging/quick-send")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Quick Send
          </Button>
          <Button onClick={() => router.push("/dashboard/messaging/campaigns?action=create")}>
            <Send className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently sending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Saved for later</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Messages delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/messaging/campaigns")}>
          <CardHeader>
            <Calendar className="h-8 w-8 text-blue-500" />
            <CardTitle className="mt-4">All Campaigns</CardTitle>
            <CardDescription>
              View and manage all your broadcast campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/messaging/campaigns" className="text-sm font-medium text-blue-500 hover:underline">
              View campaigns →
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/messaging/quick-send")}>
          <CardHeader>
            <Zap className="h-8 w-8 text-orange-500" />
            <CardTitle className="mt-4">Quick Send</CardTitle>
            <CardDescription>
              Send a message immediately to a contact or test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/messaging/quick-send" className="text-sm font-medium text-orange-500 hover:underline">
              Send now →
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/messaging/templates")}>
          <CardHeader>
            <FileText className="h-8 w-8 text-purple-500" />
            <CardTitle className="mt-4">Templates Library</CardTitle>
            <CardDescription>
              Browse, create, and manage message templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/messaging/templates" className="text-sm font-medium text-purple-500 hover:underline">
              Browse templates →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest campaign activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent campaigns. Create your first campaign to get started.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/messaging/campaigns?action=create")}>
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
