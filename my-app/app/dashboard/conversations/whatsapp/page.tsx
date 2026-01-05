"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import ChatSidebar from "@/app/dashboard/conversations/components/chat-sidebar"
import ChatArea from "@/app/dashboard/conversations/components/chat-area"
import DownloadPage from "@/app/dashboard/conversations/components/download-page"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useWhatsAppAppServices } from "@/hooks/use-whatsapp-appservices"
import { useWhatsAppChatSessions } from "@/hooks/use-whatsapp-chat-sessions"
import { useWhatsAppChatMessages } from "@/hooks/use-whatsapp-chat-messages"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import type { Conversation } from "@/app/dashboard/conversations/components/types"
import { toast } from "sonner"
import LoadingProgress from "@/components/loading-progress"
import { useSearchParams } from "next/navigation"

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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const activeOrganizationId = useActiveOrganizationId()
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null)
  const selectedConversationRef = useRef<number | null>(null)
  const messageCacheRef = useRef<Record<number, Conversation["messages"]>>({})
  const scrollPositionsRef = useRef<Record<number, number>>({})
  const conversationsRef = useRef<Conversation[]>([])
  const hasAutoSelectedRef = useRef(false)

  const {
    primaryPhoneNumber,
    isLoading: appServicesLoading,
    error: appServicesError,
  } = useWhatsAppAppServices(activeOrganizationId || undefined)

  const phoneNumber = primaryPhoneNumber

  const {
    sessions,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useWhatsAppChatSessions(activeOrganizationId || undefined, phoneNumber, 12)

  const { fetchMessages, getCachedMessages, setCachedMessages } = useWhatsAppChatMessages(phoneNumber)
  const listLoading = sessionsLoading && conversations.length === 0
  const listHasMore = Boolean(hasNextPage)

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
      const conversationMatch = conversationsRef.current.find((conv) => conv.id === conversationId)
      const customerNumber = conversationMatch?.customer_number || conversationMatch?.recipient_id
      if (customerNumber) {
        setCachedMessages(customerNumber, normalizedMessages)
      }
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
    [resolveUpdatedAt, setCachedMessages],
  )

  useEffect(() => {
    if (!activeOrganizationId) return

    if (appServicesLoading) {
      setLoadingMessage("Fetching phone configuration...")
      setLoadingProgress(20)
      return
    }

    if (appServicesError) {
      toast.error(appServicesError)
      setIsInitializing(false)
      return
    }

    if (phoneNumber) {
      setLoadingProgress(40)
      setLoadingMessage("Phone configuration loaded")
    }
  }, [activeOrganizationId, appServicesLoading, appServicesError, phoneNumber])

  useEffect(() => {
    if (!phoneNumber || !activeOrganizationId) return

    if (sessionsLoading) {
      setLoadingProgress(60)
      setLoadingMessage("Loading conversations...")
      return
    }

    if (sessionsError) {
      toast.error(sessionsError)
      setIsInitializing(false)
      return
    }

    let isActive = true

    const syncConversations = async () => {
      const readConversations = getReadConversations(phoneNumber)
      const previousById = new Map(conversationsRef.current.map((conv) => [conv.id, conv]))

      const conversationsWithMessages = sessions.map((conv: any) => {
        const existing = previousById.get(conv.id)
        const customerNumber = conv.customer_number || conv.recipient_id
        const cachedMessages = getCachedMessages(customerNumber)
        const fallbackMessages =
          cachedMessages.length > 0
            ? cachedMessages
            : existing?.messages || messageCacheRef.current[conv.id] || []

        if (fallbackMessages.length > 0 && cachedMessages.length === 0) {
          setCachedMessages(customerNumber, fallbackMessages)
        }

        const latestCachedTimestamp =
          fallbackMessages.length > 0 ? fallbackMessages[fallbackMessages.length - 1]?.created_at : undefined

        return {
          ...conv,
          messages: fallbackMessages,
          updated_at: resolveUpdatedAt(conv.updated_at, latestCachedTimestamp),
          phone_number: phoneNumber,
          recipient_id: customerNumber,
          attachments: conv.attachments || [],
          unread_messages: existing?.unread_messages ?? conv.unread_messages,
        }
      })

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
            conv.unread_messages = 0
          } catch (error) {
            console.error(`Failed to reset unread messages for ${conv.customer_number}:`, error)
          }
        })

      if (resetPromises.length > 0) {
        setLoadingMessage("Syncing read status...")
        await Promise.all(resetPromises)
      }

      if (!isActive) return

      setConversations(conversationsWithMessages)
      setLoadingProgress(100)
      setLoadingMessage("Ready!")
      setTimeout(() => {
        setIsInitializing(false)
      }, 300)
    }

    syncConversations().catch((error) => {
      console.error("Failed to sync conversations:", error)
      toast.error("Failed to fetch conversations")
      setIsInitializing(false)
    })

    return () => {
      isActive = false
    }
  }, [
    phoneNumber,
    activeOrganizationId,
    sessions,
    sessionsLoading,
    sessionsError,
    resolveUpdatedAt,
    getCachedMessages,
    setCachedMessages,
  ])

  const loadMoreConversations = async () => {
    if (!hasNextPage || isFetchingNextPage) return
    try {
      await fetchNextPage()
    } catch (error) {
      console.error("Failed to load more conversations:", error)
      toast.error("Failed to load more conversations")
    }
  }

  // Function to fetch messages for a specific conversation
  const fetchMessagesForConversation = async (customerNumber: string) => {
    if (!customerNumber) return []
    try {
      return await fetchMessages(customerNumber)
    } catch (error) {
      console.error(`Failed to fetch messages for customer ${customerNumber}:`, error)
      return []
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    selectedConversationRef.current = conversation.id
    const customerNumber = conversation.customer_number || conversation.recipient_id
    const cachedMessages = customerNumber ? getCachedMessages(customerNumber) : []
    const fallbackCache = messageCacheRef.current[conversation.id] ?? []
    const initialMessages =
      conversation.messages && conversation.messages.length > 0
        ? conversation.messages
        : cachedMessages.length > 0
          ? cachedMessages
          : fallbackCache
    const hydratedConversation =
      initialMessages && initialMessages.length > 0 ? { ...conversation, messages: initialMessages } : conversation

    if (initialMessages && initialMessages.length > 0) {
      messageCacheRef.current[conversation.id] = initialMessages
      if (customerNumber && cachedMessages.length === 0) {
        setCachedMessages(customerNumber, initialMessages)
      }
    }

    setSelectedConversation(hydratedConversation)
    // Don't reset unread messages immediately - wait until messages are loaded and viewed

    if (!initialMessages || initialMessages.length === 0) {
      setLoadingConversationId(conversation.id)
      try {
        const messages = await fetchMessagesForConversation(customerNumber)
        messageCacheRef.current[conversation.id] = messages
        if (customerNumber) {
          setCachedMessages(customerNumber, messages)
        }
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
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#e9edef] bg-white">
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
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#e9edef] bg-white shadow-lg">
      <ChatSidebar
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.id || null}
        loading={listLoading}
        hasMore={listHasMore}
        loadMore={loadMoreConversations}
        isLoadingMore={isFetchingNextPage}
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
