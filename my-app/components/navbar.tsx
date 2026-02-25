"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

interface NavChild {
  label: string
  href: string
  description: string
}

interface NavItem {
  label: string
  href?: string
  children?: NavChild[]
}

const navItems: NavItem[] = [
  {
    label: "Products",
    children: [
      {
        label: "WhatsApp Assistant",
        href: "/whatsapp-assistant",
        description: "AI-powered assistant for instant customer support",
      },
      {
        label: "WhatsApp Broadcasts",
        href: "/whatsapp-broadcast",
        description: "Send targeted campaigns on Whatsapp to your audience at scale",
      },
      {
        label: "WhatsApp API",
        href: "/whatsapp-api",
        description: "Use WhatsApp messaging for your business with our robust API",
      },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Company", href: "/company" },
  { label: "Pricing", href: "/pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { signOut } = useClerk()

  const onSignUpClick = useCallback(() => {
    if (window.fbq) {
      window.fbq("track", "Lead", { cta: "home_sign_up" })
    }
  }, [])

  const handleAuthAction = () => {
    if (isSignedIn) {
      signOut()
    } else {
      router.push("/auth/sign-in")
    }
  }

  const handleGetStartedAction = () => {
    if (isSignedIn) {
      router.push("/dashboard")
    } else {
      onSignUpClick()
      router.push("/auth/sign-up")
    }
  }

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 overflow-visible">
      {/* Section container — vertical border lines cross through */}
      <div className="mx-auto max-w-[1400px] border-x border-gray-200">
        {/* Navigation menu — transparent/flat by default, elevated on hover */}
        <div className="group/nav py-[10px]">
          <div className="flex items-center gap-7 rounded-xl px-6 py-4 bg-white/60 backdrop-blur-sm transition-[background-color,box-shadow] duration-300 group-hover/nav:bg-white group-hover/nav:shadow-[0_16px_32px_rgba(50,50,93,0.12)]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                alt="Intelli"
                src="/Intelli.svg"
                height={28}
                width={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold text-gray-900">Intelli</span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden min-[940px]:flex flex-1">
              <NavigationMenuList className="gap-7 justify-start">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 px-0 py-1.5 h-auto">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[340px] gap-1 p-2">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={child.href}
                                    className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {child.label}
                                    </div>
                                    <p className="mt-1 text-xs leading-snug text-gray-500">
                                      {child.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href!}
                          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Spacer — pushes CTAs right on mobile */}
            <div className="flex-1 min-[940px]:hidden" />

            {/* Desktop CTA Buttons */}
            <div className="hidden min-[940px]:flex items-center gap-3 shrink-0 ml-auto">
              <button
                onClick={handleAuthAction}
                className="rounded-xl px-4 py-1.5 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-50"
              >
                {isSignedIn ? "Sign out" : "Sign in"}
              </button>
              <button
                onClick={handleGetStartedAction}
                className="group/cta flex items-center gap-1.5 rounded-full bg-blue-600 rounded-xl px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
              >
                {isSignedIn ? "Dashboard" : "Get Started"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-[940px]:hidden rounded-full h-8 w-8 shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px]">
                <nav className="flex flex-col h-full pt-8">
                  <div className="flex-1 space-y-1">
                    {navItems.map((item) =>
                      item.children ? (
                        <div key={item.label}>
                          <button
                            onClick={() => toggleExpanded(item.label)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-gray-400 transition-transform duration-200",
                                expandedItems.includes(item.label) &&
                                  "rotate-180"
                              )}
                            />
                          </button>
                          {expandedItems.includes(item.label) && (
                            <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                  <div className="font-medium">
                                    {child.label}
                                  </div>
                                  <p className="mt-0.5 text-xs text-gray-400">
                                    {child.description}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href!}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>

                  {/* Mobile CTA */}
                  <div className="border-t border-gray-100 pt-4 pb-4 space-y-2 -mx-3">
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleAuthAction()
                      }}
                      className="block w-full rounded-sm px-4 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {isSignedIn ? "Sign out" : "Sign in"}
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleGetStartedAction()
                      }}
                      className="group/cta flex w-full items-center justify-center gap-2 rounded-sm bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700"
                    >
                      {isSignedIn ? "Dashboard" : "Get Started"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* Full-width horizontal line — extends edge to edge */}
      <div className="border-b border-gray-200" />
    </nav>
  )
}
