"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { AppSidebar } from "@/components/app-sidebar"
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
      <main className="flex-1 overflow-y-auto p-golden-lg">{children}</main>
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
