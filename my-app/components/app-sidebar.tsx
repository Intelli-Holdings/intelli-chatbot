"use client";

import * as React from "react";
import {
  Home,
  Building2,
  Layout,
  Bot,
  MessageCircle,
  Bell,
  BarChart,
  MessageSquareDot,
  BellDot,
  PaintRoller,
  Calendar,
  Globe,
  Globe2,
  ShieldQuestion,
  InboxIcon,
  CalendarClock,
  Contact,
  BookDashed,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/notifications-context";
import { UserNav } from "@/components/user-nav";
import { AnnouncementBanner } from "@/components/announcement";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType;
  showBadge?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: { title: string; url: string }[];
};

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Assistants",
      url: "/dashboard/assistants",
      icon: Bot,
    },
    {
      title: "Playground",
      url: "/dashboard/playground",
      icon: PaintRoller,
    },
    {
      title: "Widgets",
      url: "/dashboard/widgets",
      icon: Globe,
    },
    {
      title: "Conversations",
      url: "/dashboard/conversations",
      icon: MessageSquareDot,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellDot,
      showBadge: true,
    },   
    {
      title: "Contacts",
      url: "/dashboard/contacts",
      icon: Contact,
    },
    {
      title: "Templates",
      url: "/dashboard/templates",
      icon: BookDashed,
      hasSubmenu: true,
      submenuItems: [
        { title: "Overview", url: "/dashboard/templates/overview" },
        { title: "Templates Library", url: "/dashboard/templates" },
        { title: "Manage Templates", url: "/dashboard/templates/library" },
        { title: "Create Template", url: "/dashboard/templates/create" },
        { title: "Send Broadcasts", url: "/dashboard/templates/send" },
        
      ]
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart,
    },
    {
      title: "Organization",
      url: "/dashboard/organization",
      icon: Building2,
    },
    {
      title: "Escalation Events",
      url: "/dashboard/escalation-events",
      icon: ShieldQuestion,
    },
  ],
};

// Helper component for submenu items
const SidebarSubmenuItem = ({ 
  title, 
  url, 
  pathname 
}: { 
  title: string; 
  url: string; 
  pathname: string 
}) => {
  return (
    <SidebarMenuItem className="ml-6">
      <SidebarMenuButton asChild className="w-full">
        <Link href={url} className="w-full">
          <span
            className={cn(
              "group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium hover:bg-blue-100 hover:text-blue-600",
              pathname === url
                ? "bg-blue-500 text-white"
                : "transparent"
            )}
          >
            <span>{title}</span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activePath: string;
}

export function AppSidebar({ activePath, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { notificationCount } = useNotifications();
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({});

  // Toggle submenu visibility
  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Initialize expanded state for the menu that contains the current path
  React.useEffect(() => {
    const menuToExpand = data.navMain.find(item => 
      item.hasSubmenu && (pathname === item.url || item.submenuItems?.some(subItem => pathname === subItem.url))
    );

    if (menuToExpand) {
      setExpandedMenus(prev => ({
        ...prev,
        [menuToExpand.title]: true
      }));
    }
  }, [pathname]);

  return (
    <Sidebar variant="floating" {...props}>
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <React.Fragment key={item.title}>
                <SidebarMenuItem className="w-full">
                  {item.hasSubmenu ? (
                    <SidebarMenuButton 
                      className="w-full"
                      onClick={() => toggleSubmenu(item.title)}
                    >
                      <span className="relative w-full">
                        <span
                          className={cn(
                            "group flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-medium hover:bg-blue-100 hover:text-blue-600",
                            pathname === item.url || (item.submenuItems?.some(subItem => pathname === subItem.url))
                              ? "bg-blue-500 text-white"
                              : "transparent"
                          )}
                        >
                          <div className="flex items-center">
                            {item.icon && <item.icon className="mr-2 size-4" />}
                            <span>{item.title}</span>
                          </div>
                          {expandedMenus[item.title] ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </span>
                        {item.showBadge && notificationCount > 0 && (
                          <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                            {notificationCount}
                          </span>
                        )}
                      </span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild className="w-full">
                      <Link href={item.url} className="w-full">
                        <span className="relative w-full">
                          <span
                            className={cn(
                              "group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium hover:bg-blue-100 hover:text-blue-600",
                              pathname === item.url
                                ? "bg-blue-500 text-white"
                                : "transparent"
                            )}
                          >
                            {item.icon && <item.icon className="mr-2 size-4" />}
                            <span>{item.title}</span>
                          </span>
                          {item.showBadge && notificationCount > 0 && (
                            <span className="absolute top-[-10px] right-[-10px] bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                              {notificationCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>

                {/* Render submenu items if parent is expanded */}
                {item.hasSubmenu && expandedMenus[item.title] && item.submenuItems?.map((subItem) => (
                  <SidebarSubmenuItem 
                    key={subItem.url} 
                    title={subItem.title} 
                    url={subItem.url} 
                    pathname={pathname}
                  />
                ))}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">        
        <AnnouncementBanner />
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}