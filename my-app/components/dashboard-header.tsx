import Link from "next/link"
import { LogOut, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Folder } from "@/lib/types"

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold">Template Manager</span>
          </Link>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav currentFolder={"inbox"} onFolderChange={function (folder: Folder): void {
                          throw new Error("Function not implemented.")
                      } } onCompose={function (): void {
                          throw new Error("Function not implemented.")
                      } } />
          </SheetContent>
        </Sheet>
        <MainNav className="mx-6 hidden md:flex" />      
      </div>
    </header>
  )
}
