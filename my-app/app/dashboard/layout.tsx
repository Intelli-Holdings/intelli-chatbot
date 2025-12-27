"use client"
import { AppSidebar } from "@/components/app-sidebar"
import type React from "react"

import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { QueryClient, QueryClientProvider } from "react-query"
import { useState } from "react"

// Notifications
import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar activePath={pathname} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <NotificationIndicator />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <div suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
          <ToastProvider />
        </NotificationProvider>
      </QueryClientProvider>
    </div>
  )
}
