import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"


const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      items: [
 
      ],
    },
    {
      title: "Organization",
      url: "/dashboard/organization",
      items: [

        
      ],
    },
    {
      title: "Channels",
      url: "/dashboard/channels",
      items: [
   
      ],
    },
    {
      title: "Assistants",
      url: "/dashboard/assistants",
      items: [
        
      ],
    },
    {
      title: "Conversations",
      url: "/dashboard/conversations",
      items: [
       
      ],
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      items: [
        
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      items: [
       
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-gray-900 text-sidebar-primary-foreground">
                  
                  <Image alt="Intelli Logo" className="h-16 size-4" src="/Intelli.svg" height={25} width={25} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">Intelli</span>
                  
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>                
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
