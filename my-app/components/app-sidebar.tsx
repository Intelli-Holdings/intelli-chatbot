"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  MessageSquare,
  Globe,
  Users,
  Contact,
  SlidersHorizontal,
  Megaphone,
  FileText,
  ShoppingBag,
  BarChart3,
  Bot,
  MessageSquareCode,
  Layout,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user-nav"
import { SidebarCTA } from "@/components/dashboard/sidebar/SidebarCTA"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"
import { MessengerIcon } from "@/components/icons/messenger-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
// Menu items
// ---------------------------------------------------------------------------

const sidebarItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: Home, route: "/dashboard" },
  { id: "assistants", label: "Assistants", icon: Bot, route: "/dashboard/assistants" },
  { id: "chatbots", label: "Chatbots", icon: MessageSquareCode, route: "/dashboard/chatbots" },
  { id: "widgets", label: "Widgets", icon: Layout, route: "/dashboard/widgets" },
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    hasSubItems: true,
    subItems: [
      { id: "website", label: "Website", icon: Globe, description: "Website chat conversations", route: "/dashboard/conversations/website" },
      { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon, description: "WhatsApp Business messages", route: "/dashboard/conversations/whatsapp" },
      { id: "instagram", label: "Instagram", icon: InstagramIcon, description: "Instagram direct messages", route: "/dashboard/conversations/instagram" },
      { id: "messenger", label: "Messenger", icon: MessengerIcon, description: "Facebook Messenger chats", route: "/dashboard/conversations/messenger" },
    ],
  },
  {
    id: "audiences",
    label: "Audiences",
    icon: Users,
    hasSubItems: true,
    subItems: [
      { id: "contacts", label: "Contacts", icon: Contact, description: "Manage your contacts", route: "/dashboard/audiences/contacts" },
      { id: "segments", label: "Segments", icon: SlidersHorizontal, description: "Audience segments and filters", route: "/dashboard/audiences/segments" },
      { id: "campaigns", label: "Campaigns", icon: Megaphone, description: "Create and manage campaigns", route: "/dashboard/campaigns" },
      { id: "templates", label: "Templates", icon: FileText, description: "Message templates", route: "/dashboard/templates" },
    ],
  },
  { id: "commerce", label: "Commerce", icon: ShoppingBag, route: "/dashboard/commerce" },
  { id: "analytics", label: "Analytics", icon: BarChart3, route: "/dashboard/analytics" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRouteActive(route: string, pathname: string) {
  if (route === "/dashboard") return pathname === "/dashboard"
  return pathname === route || pathname.startsWith(route + "/")
}

function hasActiveChild(item: SidebarItem, pathname: string) {
  return item.subItems?.some((sub) => isRouteActive(sub.route, pathname)) ?? false
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const primaryActiveClass =
  "bg-[#007fff] text-white hover:bg-[#006ee6]"
const primaryDefaultClass =
  "text-foreground/80 hover:bg-[#007fff]/10 hover:text-[#007fff]"
const secondaryActiveClass =
  "bg-[#007fff]/10 text-[#007fff] hover:bg-[#007fff]/15"
const secondaryDefaultClass =
  "text-foreground/80 hover:bg-[#007fff]/10 hover:text-[#007fff]"

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openPanel, setOpenPanel] = useState<string | null>(null)

  // Close panel when collapsing
  useEffect(() => {
    if (collapsed) setOpenPanel(null)
  }, [collapsed])

  // Auto-open panel if a sub-item is active
  useEffect(() => {
    const matching = sidebarItems.find(
      (item) => item.hasSubItems && hasActiveChild(item, pathname)
    )
    if (matching && !collapsed) {
      setOpenPanel(matching.id)
    }
  }, [pathname, collapsed])

  const openPanelData = sidebarItems.find((item) => item.id === openPanel)

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      if (collapsed) {
        setCollapsed(false)
        setTimeout(() => setOpenPanel(item.id), 200)
      } else {
        setOpenPanel(openPanel === item.id ? null : item.id)
      }
    } else if (item.route) {
      setOpenPanel(null)
      router.push(item.route)
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-dvh shrink-0">
        {/* Primary sidebar */}
        <aside
          className={cn(
            "relative flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out",
            collapsed ? "w-[68px]" : "w-64"
          )}
        >
          {/* Floating toggle button */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center",
              "rounded-full border border-border bg-card shadow-md",
              "transition-colors hover:bg-accent"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>

          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-border shrink-0",
            collapsed ? "justify-center px-0" : "px-4"
          )}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-gray-900">
                <Image alt="Intelli Logo" src="/Intelli.svg" height={20} width={20} className="size-5" />
              </div>
              {!collapsed && <span className="font-bold whitespace-nowrap">Intelli</span>}
            </Link>
          </div>

          {/* Nav items — no scroll */}
          <nav className="flex-1 space-y-1 p-2 overflow-hidden">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = item.route
                ? isRouteActive(item.route, pathname)
                : hasActiveChild(item, pathname)
              const isPanelOpen = openPanel === item.id

              const button = (
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex h-10 w-full items-center rounded-lg text-sm font-medium transition-colors",
                    isActive || isPanelOpen ? primaryActiveClass : primaryDefaultClass,
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap text-left truncate">{item.label}</span>
                      {item.hasSubItems && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isPanelOpen && "rotate-90"
                          )}
                        />
                      )}
                    </>
                  )}
                </button>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.id}>{button}</div>
            })}
          </nav>

          {/* Footer */}
          <div className="shrink-0 space-y-2 border-t border-border p-2">
            {!collapsed && <SidebarCTA />}
            <UserNav collapsed={collapsed} />
          </div>
        </aside>

        {/* Secondary panel — sub-items */}
        {openPanel && openPanelData?.subItems && !collapsed && (
          <aside className="flex h-full w-72 flex-col border-r border-border bg-card animate-in slide-in-from-left-5 duration-200">
            <div className="flex h-16 items-center justify-between border-b border-border px-4 shrink-0">
              <h3 className="font-medium">{openPanelData.label}</h3>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#007fff]/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-2 overflow-hidden">
              {openPanelData.subItems.map((subItem) => {
                const SubIcon = subItem.icon
                const isSelected = isRouteActive(subItem.route, pathname)

                return (
                  <button
                    key={subItem.id}
                    type="button"
                    onClick={() => router.push(subItem.route)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                      isSelected ? secondaryActiveClass : secondaryDefaultClass
                    )}
                  >
                    <SubIcon className={cn("h-5 w-5 shrink-0 mt-0.5", isSelected && "text-[#007fff]")} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium", isSelected && "text-[#007fff]")}>
                        {subItem.label}
                      </div>
                      {subItem.description && (
                        <div className={cn("text-xs mt-0.5", isSelected ? "text-[#007fff]/70" : "text-muted-foreground")}>
                          {subItem.description}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>
        )}
      </div>
    </TooltipProvider>
  )
}
