"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Upload, UserPlus, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function AudiencesDashboard() {
  const router = useRouter()

  // Mock stats - will be replaced with real API calls
  const stats = {
    totalContacts: 3421,
    activeSegments: 8,
    importedLists: 5,
    growthRate: "+12.5%",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audiences</h1>
          <p className="text-muted-foreground">
            Manage your contacts, create segments, and import lists
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/audiences/imports?action=import")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => router.push("/dashboard/audiences/contacts?action=create")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All contacts in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSegments}</div>
            <p className="text-xs text-muted-foreground">Dynamic audience groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imported Lists</CardTitle>
            <Upload className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.importedLists}</div>
            <p className="text-xs text-muted-foreground">CSV imports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growthRate}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/audiences/contacts")}>
          <CardHeader>
            <Users className="h-8 w-8 text-blue-500" />
            <CardTitle className="mt-4">Contacts</CardTitle>
            <CardDescription>
              View and manage all your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{stats.totalContacts.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">With WhatsApp</span>
                <span className="font-medium">2,987</span>
              </div>
            </div>
            <Link href="/dashboard/audiences/contacts" className="mt-4 inline-block text-sm font-medium text-blue-500 hover:underline">
              Manage contacts →
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/audiences/segments")}>
          <CardHeader>
            <Target className="h-8 w-8 text-purple-500" />
            <CardTitle className="mt-4">Segments</CardTitle>
            <CardDescription>
              Create and manage dynamic audience segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium">{stats.activeSegments}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-updating</span>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <Link href="/dashboard/audiences/segments" className="mt-4 inline-block text-sm font-medium text-purple-500 hover:underline">
              View segments →
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push("/dashboard/audiences/imports")}>
          <CardHeader>
            <Upload className="h-8 w-8 text-green-500" />
            <CardTitle className="mt-4">Import Lists</CardTitle>
            <CardDescription>
              Import contacts from CSV files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total imports</span>
                <span className="font-medium">{stats.importedLists}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last import</span>
                <span className="font-medium">2 days ago</span>
              </div>
            </div>
            <Link href="/dashboard/audiences/imports" className="mt-4 inline-block text-sm font-medium text-green-500 hover:underline">
              Import now →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates to your audiences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">147 new contacts added</p>
                <p className="text-muted-foreground">From CSV import "BF 2025"</p>
              </div>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Segment "VIP Customers" updated</p>
                <p className="text-muted-foreground">Now contains 1,247 contacts</p>
              </div>
              <span className="text-muted-foreground">1 day ago</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                <Upload className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">CSV imported successfully</p>
                <p className="text-muted-foreground">2,145 contacts from "Webinar Q4"</p>
              </div>
              <span className="text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
