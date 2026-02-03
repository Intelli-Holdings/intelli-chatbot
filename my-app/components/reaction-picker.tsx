"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void
  currentReaction?: string
  className?: string
}

// Common WhatsApp-style reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

// Extended emoji set for the full picker
const EMOJI_CATEGORIES = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🥸",
    "🤩",
    "🥳",
  ],
  Gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
  ],
  Emotions: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❤️‍🔥",
    "❤️‍🩹",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
  ],
  Faces: [
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "😮‍💨",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
  ],
}

export function ReactionPicker({ onReactionSelect, currentReaction, className }: ReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleQuickReaction = (emoji: string) => {
    onReactionSelect(emoji)
    setIsOpen(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    onReactionSelect(emoji)
    setShowFullPicker(false)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 rounded-full bg-white/95 shadow-md hover:bg-gray-100 transition-all",
            "opacity-0 group-hover:opacity-100",
            className,
          )}
        >
          <Smile className="h-4 w-4 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" side="top">
        {!showFullPicker ? (
          <div className="flex items-center gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 text-2xl hover:bg-gray-100 rounded-lg transition-all hover:scale-110",
                  currentReaction === emoji && "bg-blue-100 ring-2 ring-blue-500",
                )}
                onClick={() => handleQuickReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
            <div className="w-px h-8 bg-gray-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowFullPicker(true)}
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        ) : (
          <div className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-sm font-semibold text-gray-700">All Emojis</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowFullPicker(false)}>
                Back
              </Button>
            </div>
            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-10 w-10 p-0 text-2xl hover:bg-gray-100 rounded-lg transition-all hover:scale-110",
                        currentReaction === emoji && "bg-blue-100 ring-2 ring-blue-500",
                      )}
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
