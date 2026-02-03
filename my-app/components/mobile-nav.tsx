"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { Folder } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"

interface MobileNavProps {
  currentFolder: Folder
  onFolderChange: (folder: Folder) => void
  onCompose: () => void
}

export function MobileNav({ currentFolder, onFolderChange, onCompose }: MobileNavProps) {
  // Use the mobileNavOpen state from the parent component
  const [open, setOpen] = useState(false)

  const handleFolderChange = (folder: Folder) => {
    onFolderChange(folder)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="p-0">
        <Sidebar
          currentFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onCompose={() => {
            onCompose()
            setOpen(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}

