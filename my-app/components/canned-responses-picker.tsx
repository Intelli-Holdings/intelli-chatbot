"use client"

import { useState, useEffect, useMemo } from "react"
import { useCannedResponses } from "@/hooks/use-canned-responses"
import { CannedResponse } from "@/types/canned-responses"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquareText, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CannedResponsesPickerProps {
  organizationId: string | undefined
  onSelect: (content: string) => void
  className?: string
}

export function CannedResponsesPicker({
  organizationId,
  onSelect,
  className,
}: CannedResponsesPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const {
    cannedResponses,
    loading,
    fetchCannedResponses,
    recordUsage,
  } = useCannedResponses(organizationId)

  useEffect(() => {
    if (open && organizationId) {
      fetchCannedResponses()
    }
  }, [open, organizationId, fetchCannedResponses])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    cannedResponses.forEach((r) => {
      if (r.category) cats.add(r.category)
    })
    return Array.from(cats).sort()
  }, [cannedResponses])

  const filteredResponses = useMemo(() => {
    return cannedResponses.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase()) ||
        (r.shortcut && r.shortcut.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory = !selectedCategory || r.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [cannedResponses, search, selectedCategory])

  const handleSelect = (response: CannedResponse) => {
    onSelect(response.content)
    recordUsage(response.id)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          title="Canned Responses"
        >
          <MessageSquareText className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {cannedResponses.length === 0
                ? "No canned responses yet"
                : "No responses match your search"}
            </div>
          ) : (
            <div className="p-1">
              {filteredResponses.map((response) => (
                <button
                  key={response.id}
                  onClick={() => handleSelect(response)}
                  className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{response.title}</span>
                    {response.shortcut && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {response.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {response.content}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
