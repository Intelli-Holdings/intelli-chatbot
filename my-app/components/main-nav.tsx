import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/dashboard/templates/overview" className="text-sm font-medium transition-colors hover:text-primary">
        Overview
      </Link>
      <Link href="/dashboard/templates/create" className="text-sm font-medium transition-colors hover:text-primary">
        Create Template
      </Link>
      <Link
        href="/dashboard/templates"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Templates Library
      </Link>
      <Link href="/dashboard/templates/send" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Send Messages
      </Link>
     
    </nav>
  )
}
