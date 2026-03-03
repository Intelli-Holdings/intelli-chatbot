"use client"

import { useState, useRef, useEffect } from "react"
import { X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { logger } from "@/lib/logger";
interface Tag {
  id: number
  name: string
  slug: string
}

interface TagInputProps {
  selectedTags?: Tag[]
  availableTags?: Tag[]
  onTagsChange: (tags: Tag[]) => void
  onCreateTag?: (tagName: string) => Promise<Tag>
  placeholder?: string
}

export function TagInput({
  selectedTags = [],
  availableTags = [],
  onTagsChange,
  onCreateTag,
  placeholder = "Type to search or create tags...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter available tags based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags([])
      setShowSuggestions(false)
      return
    }

    const searchTerm = inputValue.toLowerCase()
    const safeAvailableTags = availableTags || []
    const safeSelectedTags = selectedTags || []
    
    const unselectedTags = safeAvailableTags.filter(
      (tag) => !safeSelectedTags.some((t) => t.id === tag.id) && tag.name.toLowerCase().includes(searchTerm),
    )

    setFilteredTags(unselectedTags)
    setShowSuggestions(true)
  }, [inputValue, availableTags, selectedTags])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAddTag = (tag: Tag) => {
    onTagsChange([...selectedTags, tag])
    setInputValue("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId))
  }

  const handleCreateNew = async () => {
    if (!inputValue.trim() || !onCreateTag) return

    setIsCreating(true)
    try {
      const newTag = await onCreateTag(inputValue)
      handleAddTag(newTag)
    } catch (error) {
      logger.error("Failed to create tag:", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0])
      } else if (inputValue.trim() && onCreateTag) {
        handleCreateNew()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Selected tags display */}
      {selectedTags && selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 text-xs">
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:text-destructive"
                aria-label={`Remove ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="w-full"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && (inputValue.trim() || filteredTags.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {/* Matching tags */}
            {filteredTags.length > 0 && (
              <div>
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* Create new tag option */}
            {inputValue.trim() && !filteredTags.some((t) => t.name.toLowerCase() === inputValue.toLowerCase()) && onCreateTag && (
              <button
                onClick={handleCreateNew}
                disabled={isCreating}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-t border-gray-200 text-blue-600 transition-colors disabled:opacity-50"
              >
                + Create &quot;{inputValue}&quot;
              </button>
            )}

            {/* No results message */}
            {filteredTags.length === 0 && (!onCreateTag || !inputValue.trim()) && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {inputValue.trim() ? "No tags found" : "Start typing to search"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
