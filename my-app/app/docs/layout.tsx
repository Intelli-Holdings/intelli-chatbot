import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/docs/app-sidebar"
import { DocsPageWrapper } from "@/components/docs/docs-page-wrapper"
import type React from "react"

export const metadata = {
  title: "Intelli Documentation",
  description: "Documentation for Intelli - Your AI-powered business assistant",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="ml-3 mt-3" />
      <main className="flex-1 overflow-auto p-8 pt-16">
        <DocsPageWrapper>{children}</DocsPageWrapper>
      </main>
    </SidebarProvider>
  )
}
