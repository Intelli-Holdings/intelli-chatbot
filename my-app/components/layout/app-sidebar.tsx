"use client"

import * as React from "react"
import {
  AudioWaveform,
  BellDot,
  BookOpen,
  Bot,
  BotIcon,
  BrushIcon,
  Building,
  Command,
  Frame,
  GalleryVerticalEnd,
  GanttChartSquare,
  GitGraphIcon,
  Home,
  Map,
  MessageCircle,
  MessageCircleCodeIcon,
  MessageSquareDot,
  Paintbrush,
  Paintbrush2Icon,
  PieChart,
  Settings2,
  Terminal,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ChatBubbleIcon, DashboardIcon } from "@radix-ui/react-icons"
import { FaChartLine } from "react-icons/fa"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
 
      ],
    },
    {
      title: "Organization",
      url: "/dashboard/organization",
      icon: Building,
      isActive: true,
      items: [

        
      ],
    },
    {
      title: "Channels",
      url: "/dashboard/channels",
      icon: DashboardIcon,
      isActive: true,
      items: [
        {
          title: "Website",
          url: "/dashboard/channels/website",
        },
        {
          title: "Whatsapp",
          url: "/dashboard/channels/whatsapp",
        },
         {
          title: "Facebook",
          url: "/dashboard/channels/facebook",
        },
        {
          title: "Instagram",
          url: "/dashboard/channels/instagram",
        },
        {
          title: "Voice",
          url: "/dashboard/channels/voice",
        },
        {
          title: "Email",
          url: "/dashboard/channels/email",
        },
   
      ],
    },
    {
      title: "Assistants",
      url: "/dashboard/assistants",
      icon: BotIcon,
      isActive: true,
    },
    {
      title: "Conversations",
      url: "/dashboard/conversations",
      icon: MessageSquareDot,
      isActive: true,
      items: [
        {
          title: "Whatsapp",
          url: "/dashboard/conversations/whatsapp",
        },
        {
          title: "Website",
          url: "/dashboard/conversations/website",
        },
         {
          title: "Email",
          url: "/dashboard/conversations/email",
        },
        {
          title: "Instagram",
          url: "/dashboard/conversations/instagram",
        },      
        
      ],
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellDot,
      isActive: true,

    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: GanttChartSquare,
      isActive: false,
      items: [
        {
          title: "Whatsapp",
          url: "/dashboard/analytics/whatsapp",
        },
        {
          title: "Website",
          url: "/dashboard/analytics/website",
        },
         {
          title: "Email",
          url: "/dashboard/analytics/email",
        },
        {
          title: "Instagram",
          url: "/dashboard/analytics/instagram",
        },
      ],
    },
    {
      title: "Playground",
      url: "#",
      icon: Paintbrush,
      isActive: true,
      items: [
        {
          title: "Create Website Widget",
          url: "#",
        },
        {
          title: "Update Website Widget",
          url: "#",
        },
        {
          title: "Test Your Website Widget",
          url: "#",
        },
      ],
    },
   
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />        
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
