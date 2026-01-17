"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { List, Building2, BellDot, ShieldQuestion } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SettingsSearch } from "@/components/settings-search"

const settingsNavigation = [
  {
    title: "General",
    href: "/dashboard/settings",
  },
  {
    title: "Custom Fields",
    href: "/dashboard/settings/custom-fields",
  },
  {
    title: "Escalation Events",
    href: "/dashboard/settings/escalation-events",
  },
]

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <span>← Go to Dashboard</span>
            </Link>
          </div>

          {/* Search */}
          <div className="border-b border-border p-4">
            <SettingsSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {settingsNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">General Settings</h2>
            <p className="mt-2 text-muted-foreground">Configure your application settings and preferences</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Application Settings</h3>
              <p className="mt-2 text-sm text-muted-foreground">Manage your general application settings here.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Link
                href="/dashboard/settings/custom-fields"
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <List className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">Custom Fields</h3>
                    <p className="text-sm text-muted-foreground">Manage custom fields for contacts & campaigns</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/settings/escalation-events"
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <ShieldQuestion className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">Escalation Events</h3>
                    <p className="text-sm text-muted-foreground">Manage escalation events for your business</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
