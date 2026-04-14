"use client"

import type React from "react"
import { useState, useEffect, useRef, type ReactNode } from "react"
import { Search, MessageSquarePlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isToday, isYesterday, isThisWeek, differenceInHours } from "date-fns"
import type { Conversation } from "./types"
import { ChatListSkeleton, LoadMoreIndicator } from "@/components/loading-progress"

type SidebarVariant = "whatsapp" | "instagram"

/** Accent colors per channel variant */
const VARIANT_COLORS: Record<SidebarVariant, {
  /** Solid accent (unread badge, timestamp) */
  accent: string
  /** Background class for the unread badge */
  badgeBg: string
  /** Left-edge unread indicator – can be a class or gradient style */
  indicatorClass: string
  /** Inline style override for the indicator (used for gradients) */
  indicatorStyle?: React.CSSProperties
  /** Unread dot on the avatar */
  dotClass: string
  dotStyle?: React.CSSProperties
  /** Search focus ring */
  searchRing: string
  /** Avatar fallback bg */
  avatarBg: string
}> = {
  whatsapp: {
    accent: "text-[#25d366]",
    badgeBg: "bg-[#25d366]",
    indicatorClass: "bg-[#25d366]",
    dotClass: "bg-[#25d366]",
    searchRing: "focus-visible:ring-[#00a884]",
    avatarBg: "bg-[#6b7c85]",
  },
  instagram: {
    accent: "text-[#E1306C]",
    badgeBg: "",
    indicatorClass: "",
    indicatorStyle: { background: "linear-gradient(180deg, #833AB4, #E1306C, #F77737)" },
    dotClass: "",
    dotStyle: { background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" },
    searchRing: "focus-visible:ring-[#E1306C]",
    avatarBg: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
  },
}

interface ChatSidebarProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: number | null
  loading?: boolean
  hasMore?: boolean
  loadMore?: () => void
  isLoadingMore?: boolean
  headerExtra?: ReactNode
  variant?: SidebarVariant
}

const formatNumber = (number: number): string => {
  if (number < 1000) {
    return number.toString()
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + "K"
  } else {
    return (number / 1000000).toFixed(1) + "M"
  }
}

const formatTimestamp = (dateString: string): string => {
  const date = parseISO(dateString)
  const now = new Date()

  // Within last 24 hours or today - show HH:MM
  if (isToday(date) || differenceInHours(now, date) < 24) {
    return format(date, "HH:mm")
  }

  // Yesterday
  if (isYesterday(date)) {
    return "Yesterday"
  }

  // Within the past week - show day of week
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return format(date, "EEEE") // Full day name (e.g., "Monday")
  }

  // Older messages - show DD/MM/YYYY
  return format(date, "dd/MM/yyyy")
}

// Truncate message preview with ellipsis
const truncateMessage = (message: string, maxLength: number = 45): string => {
  if (!message) return ""
  // Remove extra whitespace and newlines
  const cleanMessage = message.replace(/\s+/g, ' ').trim()
  if (cleanMessage.length <= maxLength) return cleanMessage
  return cleanMessage.slice(0, maxLength).trim() + "..."
}

export default function ChatSidebar({
  conversations = [], // Provide default empty array
  onSelectConversation,
  selectedConversationId = null, // Added default value for selected conversation
  loading = false,
  hasMore = false,
  loadMore,
  isLoadingMore = false,
  headerExtra,
  variant = "whatsapp",
}: ChatSidebarProps) {
  const colors = VARIANT_COLORS[variant]
  const [searchTerm, setSearchTerm] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle infinite scroll
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement || !hasMore || !loadMore) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      // Load more when user scrolls to within 100px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoadingMore) {
        loadMore()
      }
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [hasMore, loadMore, isLoadingMore])

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    // Handle search filtering
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(" ")
      const customerName = conversation.customer_name ? conversation.customer_name.toLowerCase() : ""
      const customerNumber = conversation.customer_number ? conversation.customer_number.toLowerCase() : ""

      if (!searchTerms.every((term: string) => customerName.includes(term) || customerNumber.includes(term))) {
        return false
      }
    }

    return true
  })

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })

  return (
    <div className="w-[420px] border-r border-[#e9edef] bg-white flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] border-b border-[#e9edef]">
        <h1 className="text-[19px] font-semibold text-[#111b21]">Chats</h1>
      </div>

      {headerExtra && (
        <div className="px-3 py-2 border-b border-[#e9edef] bg-[#f0f2f5]/50">
          {headerExtra}
        </div>
      )}

      <div className="px-3 py-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[15px] w-[15px] text-[#667781]" />
          <Input
            placeholder="Search or start new chat"
            className={cn("pl-10 pr-4 py-2 bg-[#f0f2f5] border-none rounded-lg text-[14px] text-[#111b21] placeholder:text-[#667781] focus-visible:ring-1 h-9", colors.searchRing)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>


      <div ref={scrollRef} className="overflow-y-auto flex-1">
        {loading ? (
          <ChatListSkeleton count={8} />
        ) : sortedConversations.length > 0 ? (
          <>
            {sortedConversations.map((conversation) => {
              const latestMessage =
                conversation.messages && conversation.messages.length > 0
                  ? conversation.messages[conversation.messages.length - 1]
                  : null
              let lastMessage = latestMessage
                ? latestMessage.content || latestMessage.answer || "Open chat to see messages"
                : "Select chat to view messages"

              // Clean up media placeholders and show user-friendly text
              lastMessage = lastMessage.replace(/\[MEDIA_PLACEHOLDER\]/gi, "📎 Media")
              lastMessage = lastMessage.replace(/\[IMAGE\]\s+.+?(?:\s+-\s+https?:\/\/[^\s]+)?$/gim, "📷 Image")
              lastMessage = lastMessage.replace(/\[AUDIO\]\s+.+?(?:\s+-\s+https?:\/\/[^\s]+)?$/gim, "🎵 Audio")
              lastMessage = lastMessage.replace(/\[VIDEO\]\s+.+?(?:\s+-\s+https?:\/\/[^\s]+)?$/gim, "🎥 Video")
              lastMessage = lastMessage.replace(/\[DOCUMENT\]\s+.+?(?:\s+-\s+https?:\/\/[^\s]+)?$/gim, "📄 Document")

              const unreadCount = conversation.unread_messages || 0
              const displayName = conversation.customer_name || conversation.customer_number || "Unknown"
              const time = conversation.updated_at ? formatTimestamp(conversation.updated_at) : ""

              const isSelected = selectedConversationId === conversation.id
              const hasUnread = unreadCount > 0

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation)
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 transition-all duration-200 ease-in-out relative",
                    isSelected
                      ? "bg-[#f0f2f5]"
                      : "hover:bg-[#f5f6f6] active:bg-[#e9edef]",
                  )}
                >
                  {/* Unread indicator bar */}
                  {hasUnread && !isSelected && (
                    <div
                      className={cn("absolute left-0 top-0 bottom-0 w-1", colors.indicatorClass)}
                      style={colors.indicatorStyle}
                    />
                  )}

                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} alt={displayName} />
                      <AvatarFallback className={cn("text-white text-base", colors.avatarBg)}>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Unread count dot on avatar */}
                    {hasUnread && (
                      <div
                        className={cn("absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center", colors.dotClass)}
                        style={colors.dotStyle}
                      >
                        <span className="text-[9px] text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span
                        className={cn(
                          "truncate text-[15px]",
                          hasUnread ? "font-semibold text-[#111b21]" : "font-normal text-[#111b21]",
                        )}
                      >
                        {displayName}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] ml-2 shrink-0",
                          hasUnread ? cn(colors.accent, "font-semibold") : "text-[#667781]"
                        )}
                      >
                        {time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-[13px] leading-[1.3] flex-1 min-w-0",
                          hasUnread ? "text-[#111b21] font-medium" : "text-[#667781] font-normal"
                        )}
                      >
                        {truncateMessage(lastMessage)}
                      </p>
                      {unreadCount > 0 && (
                        <Badge
                          variant="outline"
                          className={cn("ml-1 h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-white text-[11px] font-semibold border-0 shrink-0", colors.badgeBg)}
                          style={colors.dotStyle}
                        >
                          {formatNumber(unreadCount)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Loading more indicator */}
            {isLoadingMore && <LoadMoreIndicator />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-gray-400 mb-4">
              <MessageSquarePlus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm">Conversations will appear here when customers start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
