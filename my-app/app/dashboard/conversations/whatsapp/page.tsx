"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import ChatSidebar from "@/app/dashboard/conversations/components/chat-sidebar"
import ChatArea from "@/app/dashboard/conversations/components/chat-area"
import DownloadPage from "@/app/dashboard/conversations/components/download-page"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import type { Conversation } from "@/app/dashboard/conversations/components/types"
import { toast } from "sonner"
import LoadingProgress from "@/components/loading-progress"
import { useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

type ReadConversationsMap = Record<string, string>

// Helper function to get read conversations from localStorage
const getReadConversations = (phoneNumber: string): ReadConversationsMap => {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(`readConversations_${phoneNumber}`)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return {}
    }
    if (parsed && typeof parsed === "object") {
      return parsed as ReadConversationsMap
    }
    return {}
  } catch {
    return {}
  }
}

// Helper function to save read conversations to localStorage
const saveReadConversations = (phoneNumber: string, readConversations: ReadConversationsMap) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`readConversations_${phoneNumber}`, JSON.stringify(readConversations))
  } catch (error) {
    console.error("Failed to save read conversations to localStorage:", error)
  }
}

export default function WhatsAppConvosPage() {
  const searchParams = useSearchParams()
  const customerParam = searchParams.get('customer')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const activeOrganizationId = useActiveOrganizationId()
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null)
  const selectedConversationRef = useRef<number | null>(null)
  const messageCacheRef = useRef<Record<number, Conversation["messages"]>>({})
  const scrollPositionsRef = useRef<Record<number, number>>({})
  const conversationsRef = useRef<Conversation[]>([])
  const hasAutoSelectedRef = useRef(false)

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  const resolveUpdatedAt = useCallback((current: string, latest?: string) => {
    if (!latest) return current
    const currentTime = current ? new Date(current).getTime() : 0
    const latestTime = new Date(latest).getTime()
    return latestTime > currentTime ? latest : current
  }, [])

  const handleScrollPositionChange = useCallback((conversationId: number, scrollTop: number) => {
    scrollPositionsRef.current[conversationId] = scrollTop
  }, [])

  const handleMessagesUpdate = useCallback(
    (conversationId: number, messages: Conversation["messages"]) => {
      const normalizedMessages = messages ?? []
      messageCacheRef.current[conversationId] = normalizedMessages
      const latestMessage = normalizedMessages.length > 0 ? normalizedMessages[normalizedMessages.length - 1] : null
      const latestTimestamp = latestMessage?.created_at

      setConversations((prev) => {
        let didChange = false
        const next = prev.map((conv) => {
          if (conv.id !== conversationId) return conv
          if (conv.messages === normalizedMessages) return conv

          didChange = true
          return {
            ...conv,
            messages: normalizedMessages,
            updated_at: resolveUpdatedAt(conv.updated_at, latestTimestamp),
            unread_messages: conv.id === selectedConversationRef.current ? 0 : conv.unread_messages,
          }
        })

        return didChange ? next : prev
      })

      setSelectedConversation((prev) => {
        if (!prev || prev.id !== conversationId) return prev
        if (prev.messages === normalizedMessages) return prev
        return {
          ...prev,
          messages: normalizedMessages,
          updated_at: resolveUpdatedAt(prev.updated_at, latestTimestamp),
        }
      })
    },
    [resolveUpdatedAt],
  )

  useEffect(() => {
    if (!activeOrganizationId) return

    async function fetchPhoneNumber() {
      try {
        setLoadingMessage("Fetching phone configuration...")
        setLoadingProgress(20)

        const res = await fetch(`/api/appservice/paginated/org/${activeOrganizationId}/appservices/`)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        const number = data.results?.[0]?.phone_number || ""
        setPhoneNumber(number)

        setLoadingProgress(40)
        setLoadingMessage("Phone configuration loaded")
      } catch (error) {
        console.error("Failed to fetch phone number:", error)
        toast.error("Failed to fetch phone configuration")
      }
    }

    fetchPhoneNumber()
  }, [activeOrganizationId])

  // Fetch initial conversations
  useEffect(() => {
    if (!phoneNumber || !activeOrganizationId) return

    async function fetchConversations() {
      setLoading(true)
      setLoadingProgress(50)
      setLoadingMessage("Loading conversations...")

      try {
        const startTime = Date.now()
        const res = await fetch(
          `/api/appservice/paginated/conversations/whatsapp/chat_sessions/org/${activeOrganizationId}/${phoneNumber}/?page=1&page_size=12`,
        )

        setLoadingProgress(75)
        setLoadingMessage("Processing chat data...")

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()

        setLoadingProgress(90)
        setLoadingMessage("Preparing conversations...")

        // Get previously read conversations from localStorage
        const readConversations = getReadConversations(phoneNumber)

        const conversationsWithMessages = (data.results || []).map((conv: any) => {
          const cachedMessages = messageCacheRef.current[conv.id] ?? []
          const latestCachedTimestamp =
            cachedMessages.length > 0 ? cachedMessages[cachedMessages.length - 1]?.created_at : undefined
          return {
            ...conv,
            messages: cachedMessages,
            updated_at: resolveUpdatedAt(conv.updated_at, latestCachedTimestamp),
            phone_number: phoneNumber,
            recipient_id: conv.customer_number,
            attachments: [],
          }
        })

        // Reset unread messages on backend for previously read conversations
        const resetPromises = conversationsWithMessages
          .filter((conv: any) => {
            const lastReadAt = readConversations[conv.customer_number]
            if (!lastReadAt) return false
            const lastReadTime = new Date(lastReadAt).getTime()
            const updatedAtTime = conv.updated_at ? new Date(conv.updated_at).getTime() : 0
            return (conv.unread_messages || 0) > 0 && updatedAtTime <= lastReadTime
          })
          .map(async (conv: any) => {
            try {
              await fetch(`/api/appservice/reset/unread_messages/${phoneNumber}/${conv.customer_number}/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              })
              // Update local state after successful reset
              conv.unread_messages = 0
            } catch (error) {
              console.error(`Failed to reset unread messages for ${conv.customer_number}:`, error)
            }
          })

        // Wait for all reset operations to complete
        if (resetPromises.length > 0) {
          setLoadingMessage("Syncing read status...")
          await Promise.all(resetPromises)
        }

        setConversations(conversationsWithMessages)
        setHasMore(data.next !== null)
        setPage(1)

        setLoadingProgress(100)
        setLoadingMessage("Ready!")

        // Small delay to show completion
        setTimeout(() => {
          setIsInitializing(false)
        }, 500)
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
        toast.error("Failed to fetch conversations")
        setIsInitializing(false)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [phoneNumber, activeOrganizationId, resolveUpdatedAt])

  // Function to load more conversations
  const loadMoreConversations = async () => {
    if (!phoneNumber || !activeOrganizationId || !hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/appservice/paginated/conversations/whatsapp/chat_sessions/org/${activeOrganizationId}/${phoneNumber}/?page=${nextPage}&page_size=12`,
      )
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      const newConversationsWithMessages = (data.results || []).map((conv: any) => {
        const cachedMessages = messageCacheRef.current[conv.id] ?? []
        const latestCachedTimestamp =
          cachedMessages.length > 0 ? cachedMessages[cachedMessages.length - 1]?.created_at : undefined
        return {
          ...conv,
          messages: cachedMessages,
          updated_at: resolveUpdatedAt(conv.updated_at, latestCachedTimestamp),
          phone_number: phoneNumber,
          recipient_id: conv.customer_number,
          attachments: [],
        }
      })

      setConversations((prev) => [...prev, ...newConversationsWithMessages])
      setHasMore(data.next !== null)
      setPage(nextPage)
    } catch (error) {
      console.error("Failed to load more conversations:", error)
      toast.error("Failed to load more conversations")
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Function to fetch messages for a specific conversation
  const fetchMessagesForConversation = async (customerNumber: string) => {
    try {
      const res = await fetch(
        `/api/appservice/paginated/conversations/whatsapp/chat_sessions/${phoneNumber}/${customerNumber}/`,
      )

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      // Transform the messages to match the expected format
      const messages = (data.results || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        answer: msg.answer,
        created_at: msg.created_at,
        sender: msg.sender || "ai", 
      }))

      // Reverse the messages so that the oldest appear first (latest at bottom)
      return messages.reverse()
    } catch (error) {
      console.error(`Failed to fetch messages for customer ${customerNumber}:`, error)
      return []
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    selectedConversationRef.current = conversation.id
    const cachedMessages = messageCacheRef.current[conversation.id] ?? []
    const initialMessages =
      conversation.messages && conversation.messages.length > 0 ? conversation.messages : cachedMessages
    const hydratedConversation =
      initialMessages && initialMessages.length > 0 ? { ...conversation, messages: initialMessages } : conversation

    if (initialMessages && initialMessages.length > 0) {
      messageCacheRef.current[conversation.id] = initialMessages
    }

    setSelectedConversation(hydratedConversation)
    // Don't reset unread messages immediately - wait until messages are loaded and viewed

    if (!initialMessages || initialMessages.length === 0) {
      setLoadingConversationId(conversation.id)
      try {
        const messages = await fetchMessagesForConversation(conversation.customer_number)
        messageCacheRef.current[conversation.id] = messages
        handleMessagesUpdate(conversation.id, messages)

        if (selectedConversationRef.current === conversation.id) {
          setSelectedConversation({
            ...conversation,
            messages,
          })
        }
      } catch (error) {
        console.error("Failed to fetch messages for selected conversation:", error)
        toast.error("Failed to load messages")
      } finally {
        if (selectedConversationRef.current === conversation.id) {
          setLoadingConversationId(null)
        }
      }
    } else {
      setLoadingConversationId(null)
    }

    if (isMobile) {
      setIsSheetOpen(true)
    }
  }

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (!customerParam || hasAutoSelectedRef.current || conversations.length === 0 || isInitializing) return

    const targetConversation = conversations.find(
      (conv) => conv.customer_number === customerParam || conv.recipient_id === customerParam
    )

    if (targetConversation) {
      hasAutoSelectedRef.current = true
      handleSelectConversation(targetConversation)
    }
  }, [customerParam, conversations, isInitializing])

  // Listen for unread messages reset events from ChatArea component
  useEffect(() => {
    const handleUnreadReset = (event: CustomEvent) => {
      const { customerNumber } = event.detail

      // ChatArea component already handled the API call, we just need to update local state

      // Mark this conversation as read in localStorage
      const readConversations = getReadConversations(phoneNumber)
      const readAt =
        conversationsRef.current.find((conv) => conv.customer_number === customerNumber)?.updated_at ||
        new Date().toISOString()
      readConversations[customerNumber] = readAt
      saveReadConversations(phoneNumber, readConversations)

      // Update the conversations list to reset unread count
      setConversations((prev) =>
        prev.map((conv) => (conv.customer_number === customerNumber ? { ...conv, unread_messages: 0 } : conv)),
      )
      setSelectedConversation((prev) =>
        prev?.customer_number === customerNumber ? { ...prev, unread_messages: 0 } : prev,
      )
    }

    window.addEventListener("unreadMessagesReset", handleUnreadReset as EventListener)

    return () => {
      window.removeEventListener("unreadMessagesReset", handleUnreadReset as EventListener)
    }
  }, [phoneNumber])

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen max-h-screen overflow-hidden rounded-lg border border-[#e9edef] bg-white">
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
          <LoadingProgress
            isLoading={true}
            loadingType="initial"
            currentProgress={loadingProgress}
            message={loadingMessage}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden rounded-lg border border-[#e9edef] bg-white shadow-lg">
      <ChatSidebar
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.id || null}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMoreConversations}
        isLoadingMore={isLoadingMore}
      />
      <div className="flex-1 relative bg-[#efeae2]">
        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            conversations={conversations}
            phoneNumber={phoneNumber}
            organizationId={activeOrganizationId ?? undefined}
            fetchMessages={fetchMessagesForConversation}
            isMessagesLoading={loadingConversationId === selectedConversation.id}
            initialFetchEnabled={false}
            initialScrollTop={scrollPositionsRef.current[selectedConversation.id] ?? null}
            onScrollPositionChange={handleScrollPositionChange}
            onMessagesUpdate={handleMessagesUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#f0f2f5]">
            <DownloadPage />
          </div>
        )}
      </div>

      {/* Conversation View - Mobile */}
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="w-full sm:max-w-full">
            {selectedConversation && (
              <ChatArea
                conversation={selectedConversation}
                conversations={conversations}
                phoneNumber={phoneNumber}
                organizationId={activeOrganizationId ?? undefined}
                fetchMessages={fetchMessagesForConversation}
                isMessagesLoading={loadingConversationId === selectedConversation.id}
                initialFetchEnabled={false}
                initialScrollTop={scrollPositionsRef.current[selectedConversation.id] ?? null}
                onScrollPositionChange={handleScrollPositionChange}
                onMessagesUpdate={handleMessagesUpdate}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
