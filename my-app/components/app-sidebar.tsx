"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  MessageSquare,
  Globe,
  Users,
  Contact,
  Import,
  SlidersHorizontal,
  Megaphone,
  FileText,
  ShoppingBag,
  BarChart3,
  Bot,
  MessageSquareCode,
  Layout,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { SidebarCTA } from "@/components/dashboard/sidebar/SidebarCTA"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"
import { MessengerIcon } from "@/components/icons/messenger-icon"
import type React from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  route: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  hasSubItems?: boolean
  route?: string
  subItems?: SubItem[]
}

// ---------------------------------------------------------------------------
// Menu items — single source of truth
// ---------------------------------------------------------------------------

const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    route: "/dashboard",
  },
  {
    id: "assistants",
    label: "Assistants",
    icon: Bot,
    route: "/dashboard/assistants",
  },
  {
    id: "chatbots",
    label: "Chatbots",
    icon: MessageSquareCode,
    route: "/dashboard/chatbots",
  },
  {
    id: "widgets",
    label: "Widgets",
    icon: Layout,
    route: "/dashboard/widgets",
  },
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    hasSubItems: true,
    subItems: [
      {
        id: "website",
        label: "Website",
        icon: Globe,
        description: "Website chat conversations",
        route: "/dashboard/conversations/website",
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: WhatsAppIcon,
        description: "WhatsApp Business messages",
        route: "/dashboard/conversations/whatsapp",
      },
      {
        id: "instagram",
        label: "Instagram",
        icon: InstagramIcon,
        description: "Instagram direct messages",
        route: "/dashboard/conversations/instagram",
      },
      {
        id: "messenger",
        label: "Messenger",
        icon: MessengerIcon,
        description: "Facebook Messenger chats",
        route: "/dashboard/conversations/messenger",
      },
    ],
  },
  {
    id: "audiences",
    label: "Audiences",
    icon: Users,
    hasSubItems: true,
    subItems: [
      {
        id: "contacts",
        label: "Contacts",
        icon: Contact,
        description: "Manage your contacts",
        route: "/dashboard/audiences/contacts",
      },
      {
        id: "segments",
        label: "Segments",
        icon: SlidersHorizontal,
        description: "Audience segments and filters",
        route: "/dashboard/audiences/segments",
      },
      {
        id: "campaigns",
        label: "Campaigns",
        icon: Megaphone,
        description: "Create and manage campaigns",
        route: "/dashboard/campaigns",
      },
      {
        id: "templates",
        label: "Templates",
        icon: FileText,
        description: "Message templates",
        route: "/dashboard/templates",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: ShoppingBag,
    route: "/dashboard/commerce",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    route: "/dashboard/analytics",
  },
]

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a route matches the current pathname */
function isRouteActive(route: string, pathname: string) {
  if (route === "/dashboard") return pathname === "/dashboard"
  return pathname === route || pathname.startsWith(route + "/")
}

/** Check if any sub-item of a group matches the current pathname */
function hasActiveChild(item: SidebarItem, pathname: string) {
  return item.subItems?.some((sub) => isRouteActive(sub.route, pathname)) ?? false
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const primaryActiveClass =
  "!bg-[#007fff] !text-white hover:!bg-[#006ee6] hover:!text-white"
const primaryDefaultClass =
  "text-foreground/80 hover:bg-[#007fff]/10 hover:text-[#007fff] active:bg-[#007fff]/20"
const secondaryActiveClass =
  "!bg-[#007fff]/10 !text-[#007fff] hover:!bg-[#007fff]/15"
const secondaryDefaultClass =
  "text-foreground/80 hover:bg-[#007fff]/10 hover:text-[#007fff] active:bg-[#007fff]/20"

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [openPanel, setOpenPanel] = useState<string | null>(null)

  const openPanelData = sidebarItems.find((item) => item.id === openPanel)

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      setOpenPanel(openPanel === item.id ? null : item.id)
    } else if (item.route) {
      setOpenPanel(null)
      router.push(item.route)
    }
  }

  const handleSubItemClick = (subItem: SubItem) => {
    router.push(subItem.route)
  }

  return (
    <div className="flex h-dvh">
      {/* Primary sidebar */}
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="none"
        className="w-64 border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-gray-900 text-sidebar-primary-foreground">
                    <Image
                      alt="Intelli Logo"
                      className="size-4"
                      src="/Intelli.svg"
                      height={25}
                      width={25}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold">Intelli</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  // Active = direct route match OR any child matches
                  const isActive = item.route
                    ? isRouteActive(item.route, pathname)
                    : hasActiveChild(item, pathname)
                  const isPanelOpen = openPanel === item.id

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive || isPanelOpen}
                        className={cn(
                          "w-full h-10 px-3 transition-colors",
                          isActive || isPanelOpen
                            ? primaryActiveClass
                            : primaryDefaultClass
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-auto min-w-fit">
                          {(item.badge || item.hasSubItems) &&
                            (item.badge ? (
                              <SidebarMenuBadge
                                className={cn(
                                  "min-w-fit",
                                  item.hasSubItems && "gap-x-3"
                                )}
                              >
                                {item.badge}
                                {item.hasSubItems && (
                                  <ChevronRight
                                    className={cn(
                                      "h-4 w-4 transition-transform shrink-0",
                                      isPanelOpen && "rotate-90"
                                    )}
                                  />
                                )}
                              </SidebarMenuBadge>
                            ) : (
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform shrink-0",
                                  isPanelOpen && "rotate-90"
                                )}
                              />
                            ))}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2">
          <SidebarCTA />
          <UserNav />
        </SidebarFooter>
      </Sidebar>

      {/* Secondary sidebar — sub-items panel */}
      {openPanel && openPanelData?.subItems && (
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="none"
          className="w-72 animate-in slide-in-from-left-5 duration-200 border-r"
        >
          <SidebarHeader className="flex flex-row items-center justify-between border-b px-4">
            <h3 className="font-medium">{openPanelData.label}</h3>
            <button
              type="button"
              onClick={() => setOpenPanel(null)}
              className="h-6 w-6 p-0 rounded-md hover:bg-[#007fff]/10 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {openPanelData.subItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSelected = isRouteActive(subItem.route, pathname)

                    return (
                      <SidebarMenuItem key={subItem.id}>
                        <SidebarMenuButton
                          isActive={isSelected}
                          className={cn(
                            "w-full justify-start gap-3 h-auto py-2 px-3 transition-colors",
                            isSelected
                              ? secondaryActiveClass
                              : secondaryDefaultClass
                          )}
                          onClick={() => handleSubItemClick(subItem)}
                        >
                          <SubIcon className={cn(
                            "h-5 w-5 shrink-0 self-start mt-0.5",
                            isSelected && "text-[#007fff]"
                          )} />
                          <div className="flex-1 text-left min-w-0">
                            <div className={cn(
                              "font-medium",
                              isSelected && "text-[#007fff]"
                            )}>
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div className={cn(
                                "text-xs mt-0.5",
                                isSelected
                                  ? "text-[#007fff]/70"
                                  : "text-muted-foreground"
                              )}>
                                {subItem.description}
                              </div>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
    </div>
  )
}
