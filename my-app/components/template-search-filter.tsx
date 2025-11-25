"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TemplateSearchFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
  className?: string
}

export function TemplateSearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = "Search templates by name or category...",
  className = "",
}: TemplateSearchFilterProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-10 text-sm"
        aria-label="Search templates"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
