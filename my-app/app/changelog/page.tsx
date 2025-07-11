import Link from "next/link"
import { Filter, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function Changelog() {
  return (
    <div className=" mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Changelog</h1>
          <p className="text-muted-foreground">
            Follow up on the latest improvements and updates.
            
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <Input placeholder="Search entries by date or title..." className="pl-4" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Latest</DropdownMenuItem>
            <DropdownMenuItem>Most Popular</DropdownMenuItem>
            <DropdownMenuItem>Categories</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-6">
        <Link href="/changelog/release-notes/1.00">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">February 8, 2025</p>
                <CardTitle className="text-2xl">Intelli Release Notes 1.00</CardTitle>
              </div>
              <Badge variant="secondary">New</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src="/release notes.jpeg"
                  alt="Intelli Release 3.46 Banner"
                  className="w-full rounded-lg"
                />
                <div className="prose max-w-none">
                  <p>Hey, Community!</p>
                  <p>
                    This week&apos;s IntelliNotes brings you the ability to speak with your customers in real-time on your website, easier access to whatsapp chats in an organization, improved data
                    display on the dashboard, and more! 💬
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

