"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Folder } from "@/lib/types"
import { Inbox, Send, Archive, Trash2, Star, AlertCircle, PenSquare, Settings, LogOut } from "lucide-react"

interface SidebarProps {
  currentFolder: Folder
  onFolderChange: (folder: Folder) => void
  onCompose: () => void
}

export function Sidebar({ currentFolder, onFolderChange, onCompose }: SidebarProps) {
  const folders: { id: Folder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" />, count: 12 },
    { id: "starred", label: "Starred", icon: <Star className="h-4 w-4" />, count: 3 },
    { id: "sent", label: "Sent", icon: <Send className="h-4 w-4" /> },
    { id: "drafts", label: "Drafts", icon: <PenSquare className="h-4 w-4" />, count: 2 },
    { id: "spam", label: "Spam", icon: <AlertCircle className="h-4 w-4" />, count: 5 },
    { id: "archive", label: "Archive", icon: <Archive className="h-4 w-4" /> },
    { id: "trash", label: "Trash", icon: <Trash2 className="h-4 w-4" /> },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-100/10 dark:bg-gray-800/10">
      <div className="p-4">
        <Button onClick={onCompose} className="w-full justify-start gap-2">
          <PenSquare className="h-4 w-4" />
          Compose
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={currentFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 mb-1"
              onClick={() => onFolderChange(folder.id)}
            >
              {folder.icon}
              <span className="flex-1 text-left">{folder.label}</span>
              {folder.count && (
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-50 dark:bg-gray-50 dark:text-gray-900">
                  {folder.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 mb-1">
          <Settings className="h-4 w-4" />
          Settings
        </Button>       
      </div>
    </div>
  )
}

