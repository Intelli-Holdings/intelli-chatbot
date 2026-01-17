"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MessageSquarePlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isToday, isYesterday, isThisWeek, differenceInHours } from "date-fns"
import type { Conversation } from "./types"
import { ChatListSkeleton, LoadMoreIndicator } from "@/components/loading-progress"

interface ChatSidebarProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: number | null
  loading?: boolean
  hasMore?: boolean
  loadMore?: () => void
  isLoadingMore?: boolean
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

export default function ChatSidebar({
  conversations = [], // Provide default empty array
  onSelectConversation,
  selectedConversationId = null, // Added default value for selected conversation
  loading = false,
  hasMore = false,
  loadMore,
  isLoadingMore = false,
}: ChatSidebarProps) {
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

      <div className="px-3 py-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[15px] w-[15px] text-[#667781]" />
          <Input
            placeholder="Search or start new chat"
            className="pl-10 pr-4 py-2 bg-[#f0f2f5] border-none rounded-lg text-[14px] text-[#111b21] placeholder:text-[#667781] focus-visible:ring-1 focus-visible:ring-[#00a884] h-9"
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
              lastMessage = lastMessage.replace(/\[IMAGE\]\s+\d+(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "📷 Image")
              lastMessage = lastMessage.replace(/\[AUDIO\]\s+\d+(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "🎵 Audio")
              lastMessage = lastMessage.replace(/\[VIDEO\]\s+\d+(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "🎥 Video")
              lastMessage = lastMessage.replace(/\[DOCUMENT\]\s+[^\s]+(?:\s+-\s+https?:\/\/[^\s]+)?/gi, "📄 Document")

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
                  {/* WhatsApp-style green indicator for unread */}
                  {hasUnread && !isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25d366]" />
                  )}

                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} alt={displayName} />
                      <AvatarFallback className="bg-[#6b7c85] text-white text-base">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Green dot for unread messages - WhatsApp style */}
                    {hasUnread && (
                      <div className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#25d366] rounded-full border-2 border-white flex items-center justify-center">
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
                          hasUnread ? "text-[#25d366] font-semibold" : "text-[#667781]"
                        )}
                      >
                        {time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-[13px] truncate leading-[1.3]",
                          hasUnread ? "text-[#111b21] font-medium" : "text-[#667781] font-normal"
                        )}
                      >
                        {lastMessage}
                      </p>
                      {unreadCount > 0 && (
                        <Badge
                          variant="outline"
                          className="ml-1 h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center bg-[#25d366] text-white text-[11px] font-semibold border-0 shrink-0"
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
