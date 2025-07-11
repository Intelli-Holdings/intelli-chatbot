"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'

// Notifications
import ToastProvider from "@/components/ToastProvider";
import { useNotificationContext } from "@/hooks/use-notification-context"
import { NotificationProvider } from "@/hooks/use-notification-context"
import { NotificationIndicator } from "@/components/notification-indicator"


export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient())
  const { unreadCount } = useNotificationContext()

  return (
    <div suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
      <NotificationProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
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
          <ToastProvider />
        </NotificationProvider>
      </QueryClientProvider>
    </div>
  );
}