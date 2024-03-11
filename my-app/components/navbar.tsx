import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
    return (

<div className="fixed top-0 left-0 right-0 z-10 bg-white/50 backdrop-blur-md shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center" style={{ width: "200px" }} >
            <a className="" href="/">
            <img alt="Intelli Concierge" className="h-16" src="/Logo.svg"  />
            </a>
          </div>
          <nav className="flex space-x-4">
            <a className="bold text-gray-600 hover:text-gray-900" href="/products">
              Products
            </a>
            <a className="bold text-gray-600 hover:text-gray-900" href="/chat">
              Chat with Elli
            </a>
            <a className="text-gray-600 hover:text-gray-900" href="/pricing">
              Pricing
            </a>
            <a className="text-gray-600 hover:text-gray-900" href="/resources">
              Resources
            </a>
            <a className="text-gray-600 hover:text-gray-900" href="/company">
              Company
            </a>
          </nav>
          <div className="flex space-x-2">
            <a
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-md shadow-sm hover:bg-gray-100"
              href="/auth/login"
            >
              Log In
            </a>
            <a
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              href="/auth/register"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    )
}