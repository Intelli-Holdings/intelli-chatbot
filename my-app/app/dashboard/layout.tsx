"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CreateOrganizationPopup from "@/components/CreateOrganizationPopup"; // Import the popup component
import type { Metadata } from "next";
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

  return (
    <div suppressHydrationWarning>
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
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <main className="">
            <QueryClientProvider client={queryClient}>
              <CreateOrganizationPopup />
              {children}
              <ToastProvider /> 
              </QueryClientProvider>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}