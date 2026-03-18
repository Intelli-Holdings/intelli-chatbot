"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ChatSidebar from "@/app/dashboard/conversations/components/chat-sidebar"
import InstagramChatArea from "@/app/dashboard/conversations/components/instagram-chat-area"
import DownloadPage from "@/app/dashboard/conversations/components/download-page"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useInstagramAppServices } from "@/hooks/use-instagram-appservices"
import { useInstagramChatSessions } from "@/hooks/use-instagram-chat-sessions"
import { useInstagramChatMessages } from "@/hooks/use-instagram-chat-messages"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import type { Conversation } from "@/app/dashboard/conversations/components/types"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { ConversationsSkeleton } from "@/components/conversations/conversations-skeleton"
import { useSearchParams } from "next/navigation"
import Image from "next/image"

type ReadConversationsMap = Record<string, string>
const EMPTY_MESSAGES: Conversation["messages"] = []
const EMPTY_ATTACHMENTS: NonNullable<Conversation["attachments"]> = []

const areConversationsEqual = (left: Conversation[], right: Conversation[]) => {
  if (left === right) return true
  if (left.length !== right.length) return false

  for (let index = 0; index < left.length; index += 1) {
    const prev = left[index]
    const next = right[index]

    if (prev.id !== next.id) return false
    if (prev.updated_at !== next.updated_at) return false
    if ((prev.unread_messages ?? 0) !== (next.unread_messages ?? 0)) return false
    if (prev.customer_number !== next.customer_number) return false
    if (prev.recipient_id !== next.recipient_id) return false
    if (prev.messages !== next.messages) return false
    if ((prev.attachments ?? EMPTY_ATTACHMENTS) !== (next.attachments ?? EMPTY_ATTACHMENTS)) return false
  }

  return true
}

const getReadConversations = (accountId: string): ReadConversationsMap => {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(`readConversations_ig_${accountId}`)
    if (!stored) return {}
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) return {}
    if (parsed && typeof parsed === "object") return parsed as ReadConversationsMap
    return {}
  } catch {
    return {}
  }
}

const saveReadConversations = (accountId: string, readConversations: ReadConversationsMap) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`readConversations_ig_${accountId}`, JSON.stringify(readConversations))
  } catch (error) {
    logger.error("Failed to save read conversations to localStorage", { error: error instanceof Error ? error.message : String(error) })
  }
}

export default function InstagramConvosPage() {
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
    appServices,
    primaryAccountId,
    primaryPageId,
    isLoading: appServicesLoading,
    error: appServicesError,
  } = useInstagramAppServices(activeOrganizationId || undefined)

  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const accountId = selectedAccountId || primaryAccountId
  const pageId = selectedPageId || primaryPageId

  // Auto-select first AppService when available
  useEffect(() => {
    if (!selectedAccountId && appServices.length > 0 && appServices[0].instagram_business_account_id) {
      setSelectedAccountId(appServices[0].instagram_business_account_id || "")
      setSelectedPageId(appServices[0].instagram_page_id || "")
    }
  }, [appServices, selectedAccountId])

  // Handle AppService selection change
  const handleAppServiceChange = useCallback((newAccountId: string) => {
    if (newAccountId === selectedAccountId) return

    setSelectedAccountId(newAccountId)
    // Find the matching appService to get its page_id
    const matchingService = appServices.find(s => s.instagram_business_account_id === newAccountId)
    setSelectedPageId(matchingService?.instagram_page_id || "")
    setConversations([])
    setSelectedConversation(null)
    selectedConversationRef.current = null
    hasAutoSelectedRef.current = false
    messageCacheRef.current = {}
    scrollPositionsRef.current = {}
    setIsInitializing(true)
  }, [selectedAccountId, appServices])

  const {
    sessions,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useInstagramChatSessions(activeOrganizationId || undefined, accountId, 12)

  const { fetchMessages, fetchOlderMessages, getCachedMessages, setCachedMessages, hasMore, isLoadingMore, resetPagination } =
    useInstagramChatMessages(accountId)
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
        setCachedMessages(customerNumber, normalizedMessages as NonNullable<Conversation["messages"]>)
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
      setLoadingMessage("Fetching Instagram accounts...")
      setLoadingProgress(20)
      return
    }

    if (appServicesError) {
      toast.error(appServicesError)
      setIsInitializing(false)
      return
    }

    if (accountId) {
      setLoadingProgress(40)
      setLoadingMessage("Instagram account loaded")
    }
  }, [activeOrganizationId, appServicesLoading, appServicesError, accountId])

  useEffect(() => {
    if (!accountId || !activeOrganizationId) return

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
      const readConversations = getReadConversations(accountId)
      const previousById = new Map(conversationsRef.current.map((conv) => [conv.id, conv]))

      const conversationsWithMessages = sessions.map((conv: any) => {
        const existing = previousById.get(conv.id)
        const customerNumber = conv.customer_number || conv.recipient_id
        const cachedMessages = (getCachedMessages(customerNumber) ?? [])
        const fallbackMessages =
          cachedMessages.length > 0
            ? cachedMessages
            : (existing?.messages ?? messageCacheRef.current[conv.id] ?? EMPTY_MESSAGES)

        if ((fallbackMessages?.length ?? 0) > 0 && cachedMessages.length === 0) {
          setCachedMessages(customerNumber, (fallbackMessages ?? EMPTY_MESSAGES) as NonNullable<Conversation["messages"]>)
        }

        const latestCachedTimestamp =
          (fallbackMessages && fallbackMessages.length > 0)
            ? fallbackMessages[fallbackMessages.length - 1]?.created_at
            : undefined

        return {
          ...conv,
          messages: fallbackMessages,
          updated_at: resolveUpdatedAt(conv.updated_at, latestCachedTimestamp),
          phone_number: accountId,
          recipient_id: customerNumber,
          attachments: conv.attachments ?? EMPTY_ATTACHMENTS,
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
            await fetch(`/api/appservice/reset/unread_messages/${accountId}/${conv.customer_number}/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            })
            conv.unread_messages = 0
          } catch (error) {
            logger.error("Failed to reset unread messages", { customerNumber: conv.customer_number, error: error instanceof Error ? error.message : String(error) })
          }
        })

      if (resetPromises.length > 0) {
        setLoadingMessage("Syncing read status...")
        await Promise.all(resetPromises)
      }

      if (!isActive) return

      setConversations((prev) =>
        areConversationsEqual(prev, conversationsWithMessages) ? prev : conversationsWithMessages,
      )
      setLoadingProgress(100)
      setLoadingMessage("Ready!")
      setTimeout(() => {
        setIsInitializing(false)
      }, 300)
    }

    syncConversations().catch((error) => {
      logger.error("Failed to sync conversations", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to fetch conversations")
      setIsInitializing(false)
    })

    return () => {
      isActive = false
    }
  }, [
    accountId,
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
      logger.error("Failed to load more conversations", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to load more conversations")
    }
  }

  const fetchMessagesForConversation = useCallback(
    async (customerNumber: string) => {
      if (!customerNumber) return []
      try {
        return await fetchMessages(customerNumber)
      } catch (error) {
        logger.error("Failed to fetch messages for customer", { customerNumber, error: error instanceof Error ? error.message : String(error) })
        return []
      }
    },
    [fetchMessages],
  )

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    selectedConversationRef.current = conversation.id
    const customerNumber = conversation.customer_number || conversation.recipient_id
    const cachedMessages = customerNumber ? getCachedMessages(customerNumber) : []
    const fallbackCache = messageCacheRef.current[conversation.id] ?? []
    const initialMessages =
      (conversation.messages && conversation.messages.length > 0)
        ? conversation.messages
        : (cachedMessages.length > 0 ? cachedMessages : fallbackCache)
    const hydratedConversation =
      initialMessages && initialMessages.length > 0 ? ({ ...conversation, messages: initialMessages } as Conversation) : conversation

    if (initialMessages && initialMessages.length > 0) {
      messageCacheRef.current[conversation.id] = initialMessages
      if (customerNumber && cachedMessages.length === 0) {
        setCachedMessages(customerNumber, initialMessages)
      }
    }

    setSelectedConversation(hydratedConversation)

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
          } as Conversation)
        }
      } catch (error) {
        logger.error("Failed to fetch messages for selected conversation", { error: error instanceof Error ? error.message : String(error) })
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
  }, [fetchMessagesForConversation, getCachedMessages, handleMessagesUpdate, isMobile, setCachedMessages])

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
  }, [customerParam, conversations, isInitializing, handleSelectConversation])

  // Listen for unread messages reset events
  useEffect(() => {
    const handleUnreadReset = (event: CustomEvent) => {
      const { customerNumber } = event.detail

      const readConversations = getReadConversations(accountId)
      const readAt =
        conversationsRef.current.find((conv) => conv.customer_number === customerNumber)?.updated_at ||
        new Date().toISOString()
      readConversations[customerNumber] = readAt
      saveReadConversations(accountId, readConversations)

      setConversations((prev) =>
        prev.map((conv) => (conv.customer_number === customerNumber ? { ...conv, unread_messages: 0 } : conv)),
      )
      setSelectedConversation((prev) => {
        if (!prev) return prev
        if (prev.customer_number === customerNumber) {
          return { ...prev, unread_messages: 0 } as Conversation
        }
        return prev
      })
    }

    window.addEventListener("unreadMessagesReset", handleUnreadReset as EventListener)

    return () => {
      window.removeEventListener("unreadMessagesReset", handleUnreadReset as EventListener)
    }
  }, [accountId])

  // No Instagram accounts connected
  if (!appServicesLoading && appServices.length === 0 && !isInitializing) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Image src="/instagram.png" alt="Instagram" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-lg font-semibold text-muted-foreground mb-2">No Instagram Account Connected</h1>
          <p className="text-sm text-muted-foreground">
            Connect your Instagram Business account from the Channels page to start receiving direct messages.
          </p>
        </div>
      </div>
    )
  }

  if (isInitializing) {
    return <ConversationsSkeleton />
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      {/* Left Panel - Account Selector + Conversations */}
      <div className="flex flex-col h-full">
        {/* Account Selector - only show if multiple accounts exist */}
        {appServices.length > 1 && (
          <div className="w-[420px] p-3 border-b border-[#e9edef] bg-[#f0f2f5]">
            <Select value={selectedAccountId} onValueChange={handleAppServiceChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select an Instagram account" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {appServices.map((appService) => (
                    <SelectItem
                      key={appService.id}
                      value={appService.instagram_business_account_id || ""}
                    >
                      {appService.instagram_page_name || appService.instagram_business_account_id || `Instagram ${appService.id}`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id || null}
            loading={listLoading}
            hasMore={listHasMore}
            loadMore={loadMoreConversations}
            isLoadingMore={isFetchingNextPage}
          />
        </div>
      </div>
      <div className="flex-1 relative bg-[#FAFAFA]">
        {selectedConversation ? (
          <InstagramChatArea
            conversation={selectedConversation}
            conversations={conversations}
            phoneNumber={pageId}
            instagramBusinessAccountId={accountId}
            organizationId={activeOrganizationId ?? undefined}
            fetchMessages={fetchMessagesForConversation}
            fetchOlderMessages={fetchOlderMessages}
            hasMoreMessages={hasMore}
            isLoadingOlderMessages={isLoadingMore}
            isMessagesLoading={loadingConversationId === selectedConversation.id}
            initialFetchEnabled={false}
            initialScrollTop={scrollPositionsRef.current[selectedConversation.id] ?? null}
            onScrollPositionChange={handleScrollPositionChange}
            onMessagesUpdate={handleMessagesUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#FAFAFA]">
            <DownloadPage />
          </div>
        )}
      </div>

      {/* Conversation View - Mobile */}
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="w-full sm:max-w-full">
            {selectedConversation && (
              <InstagramChatArea
                conversation={selectedConversation}
                conversations={conversations}
                phoneNumber={pageId}
                instagramBusinessAccountId={accountId}
                organizationId={activeOrganizationId ?? undefined}
                fetchMessages={fetchMessagesForConversation}
                fetchOlderMessages={fetchOlderMessages}
                hasMoreMessages={hasMore}
                isLoadingOlderMessages={isLoadingMore}
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
