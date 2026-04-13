"use client"

import type React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { QueryClient, QueryClientProvider } from "react-query"

import ToastProvider from "@/components/ToastProvider"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { userId } = useAuth()

  // Force SidebarProvider to fully remount when auth state changes
  // (e.g. after Clerk soft-navigates from sign-in → dashboard).
  // This ensures toggleSidebar and isMobile are freshly initialized.
  const sidebarKey = userId ?? "anonymous"

  return (
    <SidebarProvider
      key={sidebarKey}
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
        <main className="flex-1 overflow-y-auto p-golden-lg">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
        <ToastProvider />
      </NotificationProvider>
    </QueryClientProvider>
  )
}
