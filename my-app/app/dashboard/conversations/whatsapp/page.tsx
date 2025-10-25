"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import ChatSidebar from "@/app/dashboard/conversations/components/chat-sidebar"
import ChatArea from "@/app/dashboard/conversations/components/chat-area"
import DownloadPage from "@/app/dashboard/conversations/components/download-page"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import type { Conversation } from "@/app/dashboard/conversations/components/types"
import { toast } from "sonner"
import LoadingProgress from "@/components/loading-progress"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Helper function to get read conversations from localStorage
const getReadConversations = (phoneNumber: string): Set<string> => {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(`readConversations_${phoneNumber}`)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

// Helper function to save read conversations to localStorage
const saveReadConversations = (phoneNumber: string, readConversations: Set<string>) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`readConversations_${phoneNumber}`, JSON.stringify(Array.from(readConversations)))
  } catch (error) {
    console.error("Failed to save read conversations to localStorage:", error)
  }
}

export default function WhatsAppConvosPage() {
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

        const conversationsWithMessages = (data.results || []).map((conv: any) => ({
          ...conv,
          messages: [],
          phone_number: phoneNumber,
          recipient_id: conv.customer_number,
          attachments: [],
        }))

        // Reset unread messages on backend for previously read conversations
        const resetPromises = conversationsWithMessages
          .filter((conv: any) => readConversations.has(conv.customer_number) && (conv.unread_messages || 0) > 0)
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
  }, [phoneNumber, activeOrganizationId])

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
      const newConversationsWithMessages = (data.results || []).map((conv: any) => ({
        ...conv,
        messages: [], // Initially empty - will be loaded when conversation is selected
        phone_number: phoneNumber,
        recipient_id: conv.customer_number,
        attachments: [],
      }))

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
        sender: msg.sender || "ai", // Default to 'ai' if sender not specified
      }))

      // Reverse the messages so that the oldest appear first (latest at bottom)
      return messages.reverse()
    } catch (error) {
      console.error(`Failed to fetch messages for customer ${customerNumber}:`, error)
      return []
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    // Don't reset unread messages immediately - wait until messages are loaded and viewed

    // Fetch messages for the selected conversation if not already loaded
    if (!conversation.messages || conversation.messages.length === 0) {
      const messages = await fetchMessagesForConversation(conversation.customer_number)

      // Update the conversation with fetched messages
      const updatedConversation = {
        ...conversation,
        messages: messages,
      }

      // Update the conversations list to cache the messages
      setConversations((prev) =>
        prev.map((conv) => (conv.customer_number === conversation.customer_number ? updatedConversation : conv)),
      )

      setSelectedConversation(updatedConversation)
    } else {
      setSelectedConversation(conversation)
    }

    if (isMobile) {
      setIsSheetOpen(true)
    }
  }

  // Listen for unread messages reset events from ChatArea component
  useEffect(() => {
    const handleUnreadReset = (event: CustomEvent) => {
      const { customerNumber } = event.detail

      // ChatArea component already handled the API call, we just need to update local state

      // Mark this conversation as read in localStorage
      const readConversations = getReadConversations(phoneNumber)
      readConversations.add(customerNumber)
      saveReadConversations(phoneNumber, readConversations)

      // Update the conversations list to reset unread count
      setConversations((prev) =>
        prev.map((conv) => (conv.customer_number === customerNumber ? { ...conv, unread_messages: 0 } : conv)),
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
      <div className="flex h-screen max-h-screen overflow-hidden border rounded-xl border-gray-200">
        <div className="flex-1 flex items-center justify-center">
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
    <div className="flex h-screen max-h-screen overflow-hidden border rounded-xl border-gray-200">
      <ChatSidebar
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.id || null}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMoreConversations}
        isLoadingMore={isLoadingMore}
      />
      <div className="flex-1 relative">
        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            conversations={conversations}
            phoneNumber={phoneNumber}
            organizationId={activeOrganizationId ?? undefined}
            fetchMessages={fetchMessagesForConversation}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
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
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
