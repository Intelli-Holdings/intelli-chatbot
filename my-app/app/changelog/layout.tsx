import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image";
import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider, // Add this import
} from "@/components/ui/sidebar"

export default function ReleaseNotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {" "}
      {/* Wrap the entire layout in SidebarProvider */}
      <div className="flex w-full min-h-screen">
        {/* Left Sidebar - Release Notes Navigation */}
        <Sidebar className="w-64 border-r">
          <SidebarHeader className="border-b p-4">
          <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-blue-300">
                  <Image
                    alt="Intelli Logo"
                    className="h-16 size-4"
                    src="/Intelli.svg"
                    height={25}
                    width={25}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Intelli</span>
                  <span className="">Back to Home</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>2025 Release Notes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/changelog">Changelog</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/changelog/release-notes/1.00">Release Notes 1.00</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Add more release notes */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}

