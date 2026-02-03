"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Email } from "@/lib/types"
import { Search, RefreshCcw, MoreVertical, Menu, PenSquare } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"

interface EmailListProps {
  emails: Email[]
  selectedEmail: Email | null
  onSelectEmail: (email: Email) => void
  // Add these new props for mobile navigation
  currentFolder?: string
  onFolderChange?: (folder: any) => void
  onCompose?: () => void
  mobileNavOpen?: boolean
  setMobileNavOpen?: (open: boolean) => void
}

export function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  currentFolder,
  onFolderChange,
  onCompose,
  mobileNavOpen,
  setMobileNavOpen,
}: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full w-full flex-col border-r">
      <div className="flex items-center gap-2 border-b p-2">
        {/* Mobile navigation buttons - only visible on mobile */}
        {onCompose && (
          <>
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1"
                onClick={() => setMobileNavOpen && setMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={onCompose} className="mr-1">
                <PenSquare className="h-5 w-5" />
                <span className="sr-only">Compose</span>
              </Button>
            </div>
          </>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search emails..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" title="Refresh">
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="More options">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`cursor-pointer p-3 transition-colors hover:bg-muted/50 ${
                  selectedEmail?.id === email.id ? "bg-gray-100 dark:bg-gray-800" : ""
                } ${!email.read ? "font-medium" : ""}`}
                onClick={() => onSelectEmail(email)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={email.from.avatar} alt={email.from.name} />
                    <AvatarFallback>
                      {email.from.name
                        .split("")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className={`truncate text-sm ${!email.read ? "font-semibold" : ""}`}>{email.from.name}</p>
                      <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(email.date)}
                      </p>
                    </div>
                    <p className="truncate text-sm font-medium">{email.subject}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{email.body}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No emails found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

