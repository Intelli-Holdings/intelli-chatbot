"use client"
import { AppSidebar } from "@/components/app-sidebar"
import type React from "react"

import { usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { QueryClient, QueryClientProvider } from "react-query"
import { useState, useEffect } from "react"

// Notifications
import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isLoaded } = useAuth()

  // Wait for Clerk to finish loading before rendering.
  // Without this guard, userId transitions from undefined → real value,
  // which previously caused SidebarProvider to remount via a key change.
  // That remount left Radix UI's pointer-events: none stuck on <body>,
  // making the sidebar toggle (and other elements) unclickable until reload.
  if (!isLoaded) {
    return null
  }

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
        <header className="flex h-[55px] shrink-0 items-center gap-golden-sm px-golden-lg">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <NotificationIndicator />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-golden-lg p-golden-lg pt-0">
          <main>{children}</main>
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

  // Clear stale pointer-events: none and scroll-lock left by Radix UI
  // Sheet/Dialog during page transitions (e.g. sign-in → dashboard).
  // Run on mount and after a short delay to catch async Radix cleanup.
  useEffect(() => {
    const body = document.body
    const cleanup = () => {
      if (body.style.pointerEvents === 'none') {
        body.style.pointerEvents = ''
      }
      body.removeAttribute('data-scroll-locked')
    }
    cleanup()
    const raf = requestAnimationFrame(cleanup)
    const timer = setTimeout(cleanup, 300)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [])

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
