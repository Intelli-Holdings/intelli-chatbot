"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  Bell,
  BarChart2,
  Globe,
  Building,
  Workflow,
  Megaphone,
  Users,
  Plug,
  Code,
} from "lucide-react";

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
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Welcome to Intelli",
    icon: LayoutDashboard,
    url: "/docs",
  },
  {
    title: "Set Up Your Assistant",
    icon: Bot,
    url: "/docs/get-started/assistant",
  },
  {
    title: "Add a Website Widget",
    icon: Globe,
    url: "/docs/get-started/website-widget",
  },
  {
    title: "Connect to WhatsApp",
    icon: MessageSquare,
    url: "/docs/get-started/connect-whatsapp",
  },
  {
    title: "Chatbot Flows",
    icon: Workflow,
    url: "/docs/get-started/chatbot-flows",
  },
  {
    title: "Broadcasts & Campaigns",
    icon: Megaphone,
    url: "/docs/get-started/broadcasts",
  },
  {
    title: "Audiences & Contacts",
    icon: Users,
    url: "/docs/get-started/audiences",
  },
  {
    title: "Manage Conversations",
    icon: MessageSquare,
    url: "/docs/get-started/conversations",
  },
  {
    title: "Notifications",
    icon: Bell,
    url: "/docs/get-started/notifications",
  },
  {
    title: "Analytics",
    icon: BarChart2,
    url: "/docs/get-started/analytics",
  },
  {
    title: "Manage Your Organization",
    icon: Building,
    url: "/docs/get-started/organization",
  },
];

const developerDocs = [
  {
    title: "Channels & Integrations",
    icon: Plug,
    url: "/docs/channels",
  },
  {
    title: "API Reference",
    icon: Code,
    url: "/docs/api-reference",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/docs">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-white">
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
                  <span className="">Documentation</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Get Started</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Developer Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developerDocs.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
