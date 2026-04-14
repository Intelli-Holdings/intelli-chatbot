import React from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import {
  User,
  Building2,
  CreditCard,
  Settings,
  ChevronsUpDown,
  LogOut,
  BadgeCheck,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNotificationContext } from "@/hooks/use-notification-context"
import { cn } from "@/lib/utils"
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

const profileMenuItems = [
  { label: "Profile", icon: User, href: "/dashboard/profile" },
  { label: "Organization", icon: Building2, href: "/dashboard/organization" },
  { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
] as const

export function UserNav({ collapsed = false }: { collapsed?: boolean }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { unreadCount } = useNotificationContext()
  const router = useRouter()

  if (!isLoaded || !isSignedIn) return null

  const fullName = user.firstName || "User"
  const email = user.emailAddresses[0]?.emailAddress ?? ""

  const params = new URLSearchParams()
  params.set("width", "32")
  params.set("height", "32")
  params.set("fit", "cover")
  const optimizedImageUrl = `${user.imageUrl}?${params.toString()}`

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
            <AvatarImage src={optimizedImageUrl} alt={fullName} />
            <AvatarFallback className="rounded-lg">
              {fullName[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        {/* Header */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={optimizedImageUrl} alt={fullName} />
              <AvatarFallback className="rounded-lg">
                {fullName[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullName}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Menu items */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="rounded-xl" onSelect={() => openUserProfile()}>
            <BadgeCheck className="mr-2 size-4" />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl" onSelect={() => router.push("/dashboard/notifications")}>
            <Bell className="mr-2 size-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {profileMenuItems
            .filter((item) => item.label !== "Profile")
            .map((item) => (
              <DropdownMenuItem
                key={item.href}
                className="rounded-xl"
                onSelect={() => router.push(item.href)}
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Log out */}
        <DropdownMenuItem className="rounded-xl" onSelect={() => signOut()}>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
