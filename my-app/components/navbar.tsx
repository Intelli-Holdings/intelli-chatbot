"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUser, useClerk } from "@clerk/nextjs"

declare global {
  interface Window { fbq?: (...args: any[]) => void }
}

const navItems = [
  {
    label: "Products",
    href: "#",
    subItems: [
      { label: "WhatsApp Assistant", href: "/whatsapp-assistant" },
      { label: "WhatsApp Broadcasts", href: "/whatsapp-broadcast" },
      { label: "WhatsApp API", href: "/whatsapp-api" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Company",
    href: "/company",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
]

export function Navbar() {
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev)
  }

  const handleNavigate = (href: string) => {
    if (router) {
      router.push(href)
      setDropdownOpen(false)
    }
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false)
    }
  }, [])

  const handleAuthAction = () => {
    if (isSignedIn) {
      signOut()
    } else {
      router.push("/auth/sign-in")
    }
  }

  const onSignUpClick = useCallback(() => {
    if (window.fbq) {
      window.fbq("track", "Lead", { cta: "home_sign_up" })
    }
  }, [])

  const handleGetStartedAction = () => {
    if (isSignedIn) {
      router.push("/dashboard")
    } else {
      onSignUpClick()
      router.push("/auth/sign-up")
    }
  }

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen, handleClickOutside])

  const NavContent = ({ mobile = false }) => (
    <div className={`flex ${mobile ? "flex-col space-y-4" : "items-center space-x-20"}`}>
      {navItems.map((item) => (
        <div key={item.label} className={`relative ${mobile ? "w-full" : "flex"}`}>
          <a
            className={`text-gray-600 hover:text-yellow-500 font-medium ${mobile ? "block py-2" : ""}`}
            href={item.href}
            onClick={
              item.label === "Products"
                ? (e) => {
                    e.preventDefault()
                    handleDropdownToggle()
                  }
                : (e) => {
                    e.preventDefault()
                    handleNavigate(item.href!)
                  }
            }
          >
            {item.label}
          </a>

          {dropdownOpen && item.label === "Products" && item.subItems && (
            <div
              ref={dropdownRef}
              className={`${mobile ? "mt-2" : "absolute top-full mt-2"} w-48 bg-white shadow-lg rounded-md z-50`}
            >
              <div className="py-2">
                {item.subItems.map((subItem) => (
                  <a
                    key={subItem.label}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    href={subItem.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigate(subItem.href)
                    }}
                  >
                    {subItem.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border rounded-xl border-b border-gray-200">
      <div className="container mx-auto mx-auto max-w-[1400px] border-x border-gray-200 flex items-center justify-between p-4">
        <div className="flex items-center">
          <a className="flex items-center" href="/">
            <Image alt="Intelli Concierge" className="h-8 w-8" src="/Intelli.svg" height={32} width={32} />
            <span className="ml-2 text-2xl font-bold text-gray-900">Intelli</span>
          </a>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col h-full">
                <div className="flex-1 py-4">
                  <NavContent mobile />
                </div>
                <div className="py-4 space-y-3">
                  <button
                    onClick={handleAuthAction}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-500 rounded-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    {isSignedIn ? "Sign out" : "Sign in"}
                  </button>
                  <button
                    onClick={handleGetStartedAction}
                    className="group relative block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSignedIn ? "Dashboard" : "Get Started"}
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <>
            <NavContent />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAuthAction}
                className="px-4 py-2 text-sm font-medium text-blue-500 rounded-xl hover:bg-blue-50 transition-all duration-200"
              >
                {isSignedIn ? "Sign out" : "Sign in"}
              </button>
              <button
                onClick={handleGetStartedAction}
                className="group relative px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center gap-2">
                  {isSignedIn ? "Dashboard" : "Get Started"}
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
