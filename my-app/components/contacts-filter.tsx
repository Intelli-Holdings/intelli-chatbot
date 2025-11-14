"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"

interface Tag {
  id: number
  name: string
  slug: string
}

interface ContactsFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onTagsChange: (tagSlugs: string[]) => void
}

export function ContactsFilter({ tags, selectedTags, onTagsChange }: ContactsFilterProps) {
  const [showAllTags, setShowAllTags] = useState(false)

  const handleTagToggle = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onTagsChange(selectedTags.filter((s) => s !== slug))
    } else {
      onTagsChange([...selectedTags, slug])
    }
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  const displayedTags = showAllTags ? tags : tags.slice(0, 10)
  const hasMoreTags = tags.length > 10

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Tags</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} selected
            </Badge>
          )}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-7 text-xs gap-1 text-gray-600 hover:text-gray-900"
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug)
          return (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.slug)}
              className={`
                inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 border
                ${
                  isSelected
                    ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }
              `}
            >
              {tag.name}
              {isSelected && <X className="h-3 w-3" />}
            </button>
          )
        })}
        {hasMoreTags && !showAllTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(true)}
            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            +{tags.length - 10} more
          </Button>
        )}
        {showAllTags && hasMoreTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(false)}
            className="h-7 text-xs text-gray-600 hover:text-gray-700"
          >
            Show Less
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing contacts with {selectedTags.length === 1 ? "tag" : "any of these tags"}
        </p>
      )}
    </div>
  )
}
