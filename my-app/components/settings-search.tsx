"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchItem {
  title: string
  description?: string
  category: string
  href: string
  keywords?: string[]
}

const searchableItems: SearchItem[] = [
  {
    title: "General Settings",
    description: "Configure your application settings",
    category: "Configure",
    href: "/dashboard/settings",
    keywords: ["general", "settings", "config", "configuration"],
  },
  {
    title: "Custom Fields",
    description: "Manage custom fields for contacts",
    category: "Configure",
    href: "/dashboard/settings/custom-fields",
    keywords: ["custom", "fields", "contacts", "attributes"],
  },
  {
    title: "Escalation Events",
    description: "Manage escalation event rules",
    category: "Configure",
    href: "/dashboard/settings/escalation-events",
    keywords: ["escalation", "events", "alerts", "notifications"],
  },
]

export function SettingsSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  const filteredItems = searchableItems.filter((item) => {
    const searchText = query.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText) ||
      item.keywords?.some((keyword) => keyword.toLowerCase().includes(searchText))
    )
  })

  const groupedResults = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, SearchItem[]>,
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent"
      >
        <Search className="size-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="flex items-center border-b px-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search settings..."
              className="h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {Object.keys(groupedResults).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No results found for &quot;{query}&quot;</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category}>
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{category}</div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleSelect(item.href)}
                          className="flex w-full flex-col items-start gap-1 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent"
                        >
                          <div className="font-medium">{item.title}</div>
                          {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
