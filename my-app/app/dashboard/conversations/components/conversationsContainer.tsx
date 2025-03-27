"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import ConversationsList from "./conversationsList"
import type { Conversation } from "./types"

interface ConversationsContainerProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  loading?: boolean
}

export default function ConversationsContainer({
  conversations,
  onSelectConversation,
  loading = false,
}: ConversationsContainerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search conversations"
          className="pl-9 border-gray-100 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ConversationsList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        searchTerm={searchTerm}
        loading={loading}
      />
    </div>
  )
}

