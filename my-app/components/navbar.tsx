import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function Navbar() {
    return (
      
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/50 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <a className="" href="/">
              <Image alt="Intelli Concierge" className="h-16" src="/Intelli.svg"  height={30} width={30} />
            </a>
          </div>
          <nav className="hidden md:flex space-x-4"> {/* Hide on mobile screens */}
            <a className="text-gray-600 hover:text-gray-900" href="/pricing">
              Pricing
            </a>
            <a className="text-gray-600 hover:text-gray-900" href="/demo">
              Demo
            </a>
          </nav>
          <div className="flex space-x-2">
            <a
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-md shadow-sm hover:bg-gray-100"
              href="/auth/sign-in"
            >
              Sign In
            </a>
            <a
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              href="/auth/sign-up"
            >
Sign Up            </a>
          </div>
        </div>
      </div>
    )
}