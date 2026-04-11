"use client"

import * as React from "react"
import {
  Home,
  Building2,
  Bot,
  BarChart,
  MessageSquareDot,
  BellDot,
  Globe,
  Contact,
  ChevronDown,
  Files,
  ChevronRight,
  ChevronLeft,
  RadioTower,
  CreditCard,
  SettingsIcon,
  Workflow,
  ShoppingBag,
  Calendar,
  BadgeCheck,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { MessengerIcon } from "@/components/icons/messenger-icon"
import { InstagramIcon } from "@/components/icons/instagram-icon"

type IconComponent = React.ComponentType<{ className?: string }>

type SubItem = {
  title: string
  url: string
  icon?: IconComponent
}

type NavItem = {
  title: string
  url: string
  icon: IconComponent
  hasSubmenu?: boolean
  submenuItems?: SubItem[]
}

const navMain: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Assistants", url: "/dashboard/assistants", icon: Bot },
  { title: "Chatbots", url: "/dashboard/chatbots", icon: Workflow },
  { title: "Widgets", url: "/dashboard/widgets", icon: Globe },
  {
    title: "Conversations",
    url: "/dashboard/conversations",
    icon: MessageSquareDot,
    hasSubmenu: true,
    submenuItems: [
      { title: "Website", url: "/dashboard/conversations/website", icon: Globe },
      { title: "WhatsApp", url: "/dashboard/conversations/whatsapp", icon: WhatsAppIcon },
      { title: "Instagram", url: "/dashboard/conversations/instagram", icon: InstagramIcon },
      { title: "Messenger", url: "/dashboard/conversations/messenger", icon: MessengerIcon },
    ],
  },
  { title: "Notifications", url: "/dashboard/notifications", icon: BellDot },
  { title: "Contacts", url: "/dashboard/contacts", icon: Contact },
  { title: "Campaigns", url: "/dashboard/campaigns", icon: RadioTower },
  { title: "Templates", url: "/dashboard/templates", icon: Files },
  { title: "Commerce", url: "/dashboard/commerce", icon: ShoppingBag },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart },
  { title: "Organization", url: "/dashboard/organization", icon: Building2 },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
]

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const [openSub, setOpenSub] = React.useState<string | null>(null)
  // Tracks which submenu's flyout is open in collapsed mode (click-to-pin).
  const [pinnedFlyout, setPinnedFlyout] = React.useState<string | null>(null)

  // Auto-expand the submenu containing the current pathname
  React.useEffect(() => {
    const matching = navMain.find(
      (item) =>
        item.hasSubmenu &&
        (pathname === item.url ||
          item.submenuItems?.some((sub) => pathname === sub.url))
    )
    if (matching) {
      setOpenSub(matching.title)
    }
  }, [pathname])

  // Close any pinned flyout when sidebar expands
  React.useEffect(() => {
    if (!collapsed) setPinnedFlyout(null)
  }, [collapsed])

  // Close pinned flyout on outside click
  React.useEffect(() => {
    if (!pinnedFlyout) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest("[data-flyout-root]")) {
        setPinnedFlyout(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [pinnedFlyout])

  return (
    <aside
      className={cn(
        "group/sidebar relative flex h-svh shrink-0 flex-col border-r border-border bg-card",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* Floating toggle button — always visible */}
      <button
        type="button"
        onClick={onToggle}
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

      {/* Logo header — fixed height */}
      <div
        className={cn(
          "flex h-[4.5rem] items-center overflow-hidden whitespace-nowrap border-b border-border",
          collapsed ? "justify-center px-0" : "px-6"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-gray-900">
            <Image
              alt="Intelli Logo"
              src="/Intelli.svg"
              height={20}
              width={20}
              className="size-5"
            />
          </div>
          {!collapsed && <span className="font-bold">Intelli</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        {navMain.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.url ||
            item.submenuItems?.some((sub) => pathname === sub.url)
          const isOpen = openSub === item.title

          if (item.hasSubmenu) {
            const flyoutOpen = pinnedFlyout === item.title
            return (
              <div
                key={item.title}
                data-flyout-root
                className="group/item relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setPinnedFlyout((prev) =>
                        prev === item.title ? null : item.title
                      )
                    } else {
                      setOpenSub((prev) =>
                        prev === item.title ? null : item.title
                      )
                    }
                  }}
                  className={cn(
                    "flex h-10 w-full items-center rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </>
                  )}
                </button>

                {/* Inline sub-items when expanded */}
                {!collapsed && isOpen && item.submenuItems && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-border pl-2">
                    {item.submenuItems.map((sub) => {
                      const SubIcon = sub.icon
                      const subActive = pathname === sub.url
                      return (
                        <Link
                          key={sub.url}
                          href={sub.url}
                          className={cn(
                            "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                            subActive
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
                          <span className="whitespace-nowrap">{sub.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Flyout popover when collapsed — shown on hover OR when pinned by click */}
                {collapsed && item.submenuItems && (
                  <div
                    className={cn(
                      "absolute left-full top-0 z-50 ml-2 min-w-[12rem] rounded-md border border-border bg-card p-2 shadow-md",
                      flyoutOpen
                        ? "block"
                        : "hidden group-hover/item:block"
                    )}
                  >
                    <div className="mb-1 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {item.title}
                    </div>
                    <div className="space-y-1">
                      {item.submenuItems.map((sub) => {
                        const SubIcon = sub.icon
                        const subActive = pathname === sub.url
                        return (
                          <Link
                            key={sub.url}
                            href={sub.url}
                            onClick={() => setPinnedFlyout(null)}
                            className={cn(
                              "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                              subActive
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
                            <span className="whitespace-nowrap">{sub.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.title}
              href={item.url}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group/item relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.title}</span>
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 z-50 hidden whitespace-nowrap rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-md group-hover/item:block">
                  {item.title}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-border p-2">
        {!collapsed && (
          <a
            href="https://cal.com/intelli-demo/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-200 px-3 py-1.5 text-xs shadow-sm transition-colors hover:bg-indigo-300"
          >
            <div className="rounded-full border border-blue-300 bg-white p-1">
              <Calendar className="h-3 w-3 text-black" />
            </div>
            <div className="leading-tight">
              <strong className="text-white">Talk to our Team</strong>
              <br />
              <span className="font-normal text-white">30 min call</span>
            </div>
          </a>
        )}
        <UserNav collapsed={collapsed} />
      </div>
    </aside>
  )
}

function UserNav({ collapsed }: { collapsed: boolean }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  if (!isLoaded || !isSignedIn) return null

  const imageUrl = user?.imageUrl
  const params = new URLSearchParams()
  params.set("width", "32")
  params.set("height", "32")
  params.set("fit", "cover")
  const optimizedImageUrl = imageUrl ? `${imageUrl}?${params.toString()}` : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center rounded-lg p-2 transition-colors hover:bg-muted",
            collapsed ? "justify-center" : "gap-2"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0 rounded-lg">
            {optimizedImageUrl && (
              <AvatarImage src={optimizedImageUrl} alt={user?.firstName ?? "User"} />
            )}
            <AvatarFallback className="rounded-lg">
              {user?.firstName?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.firstName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {optimizedImageUrl && (
                <AvatarImage src={optimizedImageUrl} alt={user?.firstName ?? "User"} />
              )}
              <AvatarFallback className="rounded-lg">
                {user?.firstName?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.firstName}</span>
              <span className="truncate text-xs">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => openUserProfile()}>
            <BadgeCheck className="mr-2 size-4" />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()}>
          <LogOut className="mr-2 size-4" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
