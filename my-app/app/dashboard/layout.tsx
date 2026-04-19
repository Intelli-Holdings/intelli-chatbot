"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationIndicator } from "@/components/notification-indicator"
import { QueryClient, QueryClientProvider } from "react-query"

import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return <div className="min-h-svh w-full bg-background" />
  }

  return (
    <div className="flex h-svh w-full bg-background">
      <AppSidebar />
      <main className="relative flex-1 overflow-y-auto p-golden-lg">
        <div className="fixed right-6 top-4 z-30 rounded-full border border-border bg-card shadow-md">
          <NotificationIndicator />
        </div>
        {children}
      </main>
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
