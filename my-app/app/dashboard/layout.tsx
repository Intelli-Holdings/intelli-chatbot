"use client"

import type React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { QueryClient, QueryClientProvider } from "react-query"

import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  // Single source of truth for sidebar visibility — no context, no library.
  const [collapsed, setCollapsed] = useState(false)
  const toggle = () => setCollapsed((prev) => !prev)

  return (
    <div className="flex h-svh w-full bg-background">
      <AppSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[55px] shrink-0 items-center gap-golden-sm border-b border-border px-golden-lg">
          <div className="ml-auto">
            <NotificationIndicator />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-golden-lg">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
        <ToastProvider />
      </NotificationProvider>
    </QueryClientProvider>
  )
}
