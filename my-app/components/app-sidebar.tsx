"use client"

import * as React from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { coreItems, workspaceItems } from "@/config/sidebar"
import { SidebarNav } from "@/components/dashboard/sidebar/SidebarNav"
import { UserNav } from "@/components/user-nav"
import { SidebarCTA } from "@/components/dashboard/sidebar/SidebarCTA"
import { useNotificationContext } from "@/hooks/use-notification-context"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activePath: string
}

export function AppSidebar({ activePath, ...props }: AppSidebarProps) {
  const { unreadCount } = useNotificationContext()

  return (
    <Sidebar variant="floating" {...props}>
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-gray-900 text-sidebar-primary-foreground">
                  <Image
                    alt="Intelli Logo"
                    className="h-16 size-4"
                    src="/Intelli.svg"
                    height={25}
                    width={25}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">Intelli</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Scrollable navigation */}
      <SidebarContent>
        <SidebarNav
          coreItems={coreItems}
          workspaceItems={workspaceItems}
          notificationCount={unreadCount}
        />
      </SidebarContent>

      {/* Fixed footer */}
      <SidebarFooter className="border-t">
        <SidebarCTA />
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
