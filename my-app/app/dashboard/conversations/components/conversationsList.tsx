"use client"

import type React from "react"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Conversation } from "./types"

interface ConversationsListProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  searchTerm?: string
  loading?: boolean
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

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onSelectConversation,
  searchTerm = "",
  loading = false,
}) => {
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true

    const searchTerms = searchTerm.toLowerCase().split(" ")
    const customerName = conversation.customer_name ? conversation.customer_name.toLowerCase() : ""
    const customerNumber = conversation.customer_number ? conversation.customer_number.toLowerCase() : ""

    return searchTerms.every((term: string) => customerName.includes(term) || customerNumber.includes(term))
  })

  const SkeletonLoader = () => (
    <div className="flex flex-col space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex w-full p-4 border rounded-lg shadow-md">
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[40px]" />
            </div>
            <Skeleton className="h-3 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return <SkeletonLoader />
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredConversations.map((conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1]?.content || "No messages yet"
        const unreadCount = conversation.messages.filter((m) => !m.read).length

        return (
          <button
            key={conversation.id}
            className="flex w-full flex-col items-start gap-2 rounded-lg shadow-md border p-4 text-left text-sm transition-all hover:bg-accent"
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex justify-between items-center mb-1 w-full">
                <span className="font-semibold truncate max-w-[70%]">
                  {conversation.customer_name || conversation.customer_number}
                </span>
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {format(parseISO(conversation.updated_at), "HH:mm")}
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground truncate max-w-[70%]">{lastMessage}</span>
                {unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-2 h-5 min-w-[24px] p-2 rounded-full flex items-center justify-center bg-blue-500 text-white shrink-0"
                  >
                    {formatNumber(unreadCount)}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        )
      })}
      {filteredConversations.length === 0 && !loading && (
        <div className="text-sm text-muted-foreground">No conversations found.</div>
      )}
    </div>
  )
}

export default ConversationsList

