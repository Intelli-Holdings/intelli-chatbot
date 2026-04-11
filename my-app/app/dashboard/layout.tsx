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

  // Don't mount SidebarProvider until Clerk has resolved the auth state.
  // Previously we used `key={userId}` to force a remount when userId
  // resolved from undefined → real, but that unmount/remount cycle
  // raced with useIsMobile()'s hasMounted gate and the sidebar's CSS
  // transition, leaving the menu off-canvas (left: -16rem) on first
  // navigation. Mounting once, with auth already resolved, avoids the
  // race entirely.
  if (!isLoaded) {
    return <div className="min-h-svh w-full bg-background" />
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
  useEffect(() => {
    const body = document.body
    if (body.style.pointerEvents === 'none') {
      body.style.pointerEvents = ''
    }
    body.removeAttribute('data-scroll-locked')
  })

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
