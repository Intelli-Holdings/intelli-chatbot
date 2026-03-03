"use client"
import { AppSidebar } from "@/components/app-sidebar"
import type React from "react"

import { usePathname } from "next/navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { QueryClient, QueryClientProvider } from "react-query"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Notifications
import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"

// Tour — only needed in dashboard
const TourProviderWrapper = dynamic(() => import('@/components/tour-provider-wrapper'), { ssr: false })

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
          <SidebarTrigger id="tour-step-sidebar-toggle" className="-ml-1" />
          <div id="tour-step-notifications" className="ml-auto">
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

  // Clear stale pointer-events: none left by Radix UI Sheet/Dialog
  // during page transitions (e.g. sign-in → dashboard).
  useEffect(() => {
    const body = document.body
    if (body.style.pointerEvents === 'none') {
      body.style.pointerEvents = ''
    }
    // Also remove Radix scroll-lock attributes that may persist
    body.removeAttribute('data-scroll-locked')
  }, [])

  return (
    <div suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <TourProviderWrapper>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
          </TourProviderWrapper>
          <ToastProvider />
        </NotificationProvider>
      </QueryClientProvider>
    </div>
  )
}
