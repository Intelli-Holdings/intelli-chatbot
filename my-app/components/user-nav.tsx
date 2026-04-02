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
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
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

export function UserNav() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { isMobile } = useSidebar()
  const router = useRouter()

  if (!isLoaded || !isSignedIn) return null

  const fullName =
    user.firstName || "User"
  const email = user.emailAddresses[0]?.emailAddress ?? ""

  const params = new URLSearchParams()
  params.set("width", "32")
  params.set("height", "32")
  params.set("fit", "cover")
  const optimizedImageUrl = `${user.imageUrl}?${params.toString()}`

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={optimizedImageUrl}
                  alt={fullName}
                />
                <AvatarFallback className="rounded-lg">
                  {fullName[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Header */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={optimizedImageUrl}
                    alt={fullName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {fullName[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}