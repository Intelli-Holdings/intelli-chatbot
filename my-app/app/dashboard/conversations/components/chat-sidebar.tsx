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
  const [activeTab, setActiveTab] = useState("all")
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

  // Filter conversations based on search term and active tab
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

    // Handle tab filtering (placeholder logic - implement as needed)
    if (activeTab === "unread") {
      return (conversation.unread_messages || 0) > 0
    }
    return true
  })

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })

  return (
    <div className="w-[435px] border-r bg-white flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-white">
        <h1 className="text-xl font-bold">Whatsapp Chats</h1>

        {/* Buttons for creating new chat and more options
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        */}
      </div>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search conversations"
            className="pl-10 bg-[#f0f2f5] border-none rounded-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs for filtering conversations 
      
            <Tabs defaultValue="all" className="px-2" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 h-9 bg-transparent">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-sm">
            Unread
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm">
            Favorites
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-sm">
            Groups
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      */}

      <div ref={scrollRef} className="overflow-y-auto flex-1">
        {loading ? (
          <ChatListSkeleton count={8} />
        ) : sortedConversations.length > 0 ? (
          <>
            {sortedConversations.map((conversation) => {
              const lastMessage =
                conversation.messages && conversation.messages.length > 0
                  ? conversation.messages[conversation.messages.length - 1]?.content || "Open chat to see messages"
                  : "Select chat to view messages"
              const unreadCount = conversation.unread_messages || 0
              const displayName = conversation.customer_name || conversation.customer_number || "Unknown"
              const time = conversation.updated_at ? formatTimestamp(conversation.updated_at) : ""

              const isSelected = selectedConversationId === conversation.id

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation)
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 transition-all duration-150",
                    isSelected
                      ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-100",
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} alt={displayName} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={cn("font-medium truncate", isSelected ? "text-blue-700" : "text-gray-900")}>
                        {displayName}
                      </span>
                      <span className={cn("text-xs", isSelected ? "text-blue-600" : "text-gray-500")}>{time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
                      {unreadCount > 0 && (
                        <Badge
                          variant="outline"
                          className="ml-2 h-5 min-w-[24px] p-1 rounded-full flex items-center justify-center bg-blue-500 text-white text-xs shrink-0"
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
