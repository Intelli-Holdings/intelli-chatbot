"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import InstagramMessageInput from "./instagram-message-input"
import { extractMedia } from "@/utils/extractMedia"
import { AudioPlayer, VideoPlayer, ImagePreview, formatMessage } from "@/utils/formatMessage"
import type { Conversation, ChatMessage } from "./types"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import ConversationHeader from "./conversationsHeader"
import { ScrollToBottomButton } from "@/app/dashboard/conversations/components/scroll-to-bottom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FolderDown, File, FileImage, Music, Video, FileText, CornerDownLeft } from "lucide-react"
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from "@/utils/exportUtils"
import "./instagram-message-bubble.css"
import { logger } from "@/lib/logger"
import { WebSocketHandler } from "@/components/websocket-handler"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { MessageStatus } from "@/app/dashboard/conversations/components/message-status"
import { CannedResponsesDialog } from "@/components/canned-responses-dialog"

interface InstagramChatAreaProps {
  conversation: Conversation | null
  conversations: Conversation[]
  phoneNumber: string // This should be instagram_page_id for WebSocket
  instagramBusinessAccountId: string
  organizationId?: string
  fetchMessages?: (conversationId: string) => Promise<Conversation["messages"]>
  fetchOlderMessages?: (conversationId: string) => Promise<ChatMessage[]>
  hasMoreMessages?: boolean
  isLoadingOlderMessages?: boolean
  isMessagesLoading?: boolean
  initialFetchEnabled?: boolean
  initialScrollTop?: number | null
  onScrollPositionChange?: (conversationId: number, scrollTop: number) => void
  onMessagesUpdate?: (conversationId: number, messages: Conversation["messages"]) => void
}

interface MediaPreviewState {
  isOpen: boolean
  url: string
  type: string
  filename?: string
}

/**
 * Detect Instagram-specific message types from content prefixes.
 */
function detectInstagramMessageType(content: string | null): { type: string; text: string } | null {
  if (!content) return null
  if (content.startsWith("[Story Reply]")) {
    return { type: "story_reply", text: content.replace("[Story Reply]", "").trim() }
  }
  if (content.startsWith("[Story Mention]")) {
    return { type: "story_mention", text: content.replace("[Story Mention]", "").trim() }
  }
  if (content.startsWith("[Shared Post]")) {
    return { type: "shared_post", text: content.replace("[Shared Post]", "").trim() }
  }
  if (content.includes("[MEDIA_PLACEHOLDER]")) {
    return { type: "shared_media", text: "Shared a post" }
  }
  if (content.startsWith("[REACTION]") || content.startsWith("[Reaction]")) {
    return { type: "reaction", text: content.replace(/\[REACTION\]|\[Reaction\]/i, "").trim() }
  }
  return null
}

export default function InstagramChatArea({
  conversation,
  conversations,
  phoneNumber,
  instagramBusinessAccountId,
  organizationId,
  fetchMessages,
  fetchOlderMessages,
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  isMessagesLoading,
  initialFetchEnabled = true,
  initialScrollTop = null,
  onScrollPositionChange,
  onMessagesUpdate,
}: InstagramChatAreaProps) {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const dummyRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [lastMessageId, setLastMessageId] = useState<number | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Conversation["messages"]>([])
  const currentMessagesRef = useRef<Conversation["messages"]>(currentMessages)
  const [mediaPreview, setMediaPreview] = useState<MediaPreviewState>({
    isOpen: false,
    url: "",
    type: "",
  })
  const [isAiSupport, setIsAiSupport] = useState<boolean>()
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [isFetchingMessages, setIsFetchingMessages] = useState(false)
  const isLoadingMessages = typeof isMessagesLoading === "boolean" ? isMessagesLoading : isFetchingMessages
  const scrollRestoreConversationId = useRef<number | null>(null)
  const scrollUpdateFrameRef = useRef<number | null>(null)
  const lastConversationIdRef = useRef<number | null>(null)
  const conversationIdRef = useRef<number | null>(null)
  const onMessagesUpdateRef = useRef<typeof onMessagesUpdate>(onMessagesUpdate)
  const conversationId = conversation?.id
  const conversationMessages = conversation?.messages
  const conversationCustomerNumber = conversation?.customer_number || conversation?.recipient_id

  // Canned response dialog state
  const [showCannedResponses, setShowCannedResponses] = useState(false)

  // Update refs when props change
  useEffect(() => {
    conversationIdRef.current = conversation?.id ?? null
    onMessagesUpdateRef.current = onMessagesUpdate
  }, [conversation?.id, onMessagesUpdate])

  const normalizeMessages = useCallback((messages: Conversation["messages"]) => {
    const nextMessages = (messages ?? []).filter(Boolean)
    const seen = new Set<string>()
    const deduped: Conversation["messages"] = []

    for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
      const message = nextMessages[index]
      const key = message.whatsapp_message_id
        ? `wamid:${message.whatsapp_message_id}`
        : typeof message.id === "number"
          ? `id:${message.id}`
          : `fallback:${message.sender}:${message.created_at}:${message.content ?? ""}:${message.answer ?? ""}:${message.type ?? ""}:${message.media ?? ""}`

      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(message)
    }

    return deduped.reverse()
  }, [])

  const setMessagesState = useCallback(
    (messages: Conversation["messages"]) => {
      const nextMessages = normalizeMessages(messages)
      currentMessagesRef.current = nextMessages
      setCurrentMessages(nextMessages)
      return nextMessages
    },
    [normalizeMessages],
  )

  const syncMessagesToParent = useCallback((messages: Conversation["messages"]) => {
    const nextMessages = messages ?? []
    const activeConversationId = conversationIdRef.current
    if (!activeConversationId || !onMessagesUpdateRef.current) return
    onMessagesUpdateRef.current(activeConversationId, nextMessages)
  }, [])

  const setMessagesAndSync = useCallback(
    (messages: Conversation["messages"]) => {
      const nextMessages = setMessagesState(messages)
      syncMessagesToParent(nextMessages)
    },
    [setMessagesState, syncMessagesToParent],
  )

  const updateMessagesAndSync = useCallback(
    (updater: (prev: Conversation["messages"]) => Conversation["messages"]) => {
      const prevMessages = currentMessagesRef.current ?? []
      const nextMessages = setMessagesState(updater(prevMessages))
      syncMessagesToParent(nextMessages)
      return nextMessages
    },
    [setMessagesState, syncMessagesToParent],
  )

  const messageSkeletons = [
    { align: "left", width: "w-[60%]" },
    { align: "right", width: "w-[45%]" },
    { align: "left", width: "w-[70%]" },
    { align: "right", width: "w-[50%]" },
    { align: "left", width: "w-[55%]" },
  ]

  const handleCannedResponseInsert = useCallback((content: string) => {
    window.dispatchEvent(
      new CustomEvent("setCannedResponse", { detail: { content } }),
    )
    setShowCannedResponses(false)
  }, [])

  // Set initial messages when conversation changes
  useEffect(() => {
    if (!conversationId) return

    const isSameConversation = lastConversationIdRef.current === conversationId
    const incomingMessages = conversationMessages ?? []
    if (isSameConversation) {
      if (incomingMessages.length > 0 && incomingMessages !== currentMessagesRef.current) {
        setMessagesState(incomingMessages)
        setLastMessageId(
          incomingMessages.length > 0 ? Math.max(...incomingMessages.map((msg) => msg.id)) : null,
        )
      }
      return
    }

    lastConversationIdRef.current = conversationId
    let isActive = true
    setIsInitialLoad(true)
    setShouldAutoScroll(initialScrollTop === null)

    const existingMessages = incomingMessages
    if (existingMessages.length > 0) {
      setMessagesState(existingMessages)
      setLastMessageId(Math.max(...existingMessages.map((msg) => msg.id)))
      setIsFetchingMessages(false)
      return () => {
        isActive = false
      }
    }

    setMessagesState([])
    setLastMessageId(null)

    if (fetchMessages && initialFetchEnabled && conversationCustomerNumber) {
      setIsFetchingMessages(true)
      const loadMessages = async () => {
        try {
          const messages = await fetchMessages(conversationCustomerNumber)
          if (!isActive) return
          setMessagesAndSync(messages)
          setLastMessageId((messages?.length ?? 0) > 0 ? Math.max(...(messages ?? []).map((msg) => msg.id)) : null)
        } catch (error) {
          if (!isActive) return
          logger.error("Failed to fetch messages for conversation", { error: error instanceof Error ? error.message : String(error) })
          setMessagesState([])
          setLastMessageId(null)
        } finally {
          if (isActive) {
            setIsFetchingMessages(false)
          }
        }
      }
      loadMessages()
    } else {
      setIsFetchingMessages(false)
    }

    return () => {
      isActive = false
    }
  }, [
    conversationId,
    conversationMessages,
    conversationCustomerNumber,
    fetchMessages,
    initialFetchEnabled,
    initialScrollTop,
    setMessagesAndSync,
    setMessagesState,
  ])

  useEffect(() => {
    if (isLoadingMessages) return
    const timer = setTimeout(() => setIsInitialLoad(false), 150)
    return () => clearTimeout(timer)
  }, [conversationId, isLoadingMessages])

  useEffect(() => {
    if (!conversation || isLoadingMessages) return
    if (!scrollAreaRef.current) return
    if (scrollRestoreConversationId.current === conversation.id) return

    const frame = requestAnimationFrame(() => {
      const container = scrollAreaRef.current
      if (!container) return

      if (typeof initialScrollTop === "number") {
        container.scrollTop = initialScrollTop
      } else if (dummyRef.current) {
        dummyRef.current.scrollIntoView({ behavior: "auto" })
      }

      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
      setShouldAutoScroll(distanceFromBottom <= 120)
      scrollRestoreConversationId.current = conversation.id
    })

    return () => cancelAnimationFrame(frame)
  }, [conversation, isLoadingMessages, initialScrollTop])

  // Reset unread messages when conversation is viewed
  useEffect(() => {
    if (!conversation || isLoadingMessages) return
    if ((conversation.unread_messages || 0) > 0) {
      const resetTimer = setTimeout(async () => {
        try {
          await fetch(`/api/appservice/reset/unread_messages/${phoneNumber}/${conversation.customer_number}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })

          window.dispatchEvent(
            new CustomEvent("unreadMessagesReset", {
              detail: {
                customerNumber: conversation.customer_number,
                phoneNumber: phoneNumber,
              },
            }),
          )
        } catch (error) {
          logger.error("Failed to reset unread messages", { error: error instanceof Error ? error.message : String(error) })
        }
      }, 1000)

      return () => clearTimeout(resetTimer)
    }
  }, [conversation, phoneNumber, isLoadingMessages])

  // Listen for AI support changes
  useEffect(() => {
    const handleAiSupportChange = (event: CustomEvent) => {
      const newIsAiSupport = event.detail.isAiSupport
      setIsAiSupport(newIsAiSupport)
      if (newIsAiSupport && wsInstance) {
        setWsInstance(null)
      }
    }

    window.addEventListener("aiSupportChanged", handleAiSupportChange as unknown as EventListener)
    return () => {
      window.removeEventListener("aiSupportChanged", handleAiSupportChange as unknown as EventListener)
    }
  }, [wsInstance])

  // Listen for new messages from WebSocketHandler
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const newMessage = event.detail.message
      if (!newMessage) return

      let matchedPending = false
      let isDuplicate = false

      updateMessagesAndSync((messages) => {
        const nextMessages = messages || []

        const recentPendingIndex = nextMessages.findIndex((msg) => {
          if (!msg.pending) return false

          if (newMessage.sender === 'human') {
            const answerMatches =
              msg.answer && newMessage.answer &&
              msg.answer.trim() === newMessage.answer.trim()
            return answerMatches
          }

          const contentMatches =
            msg.content && newMessage.content &&
            msg.content.trim() === newMessage.content.trim()
          return contentMatches
        })

        if (recentPendingIndex !== -1) {
          matchedPending = true
          const updated = [...nextMessages]
          updated[recentPendingIndex] = {
            ...newMessage,
            pending: false,
            status: newMessage.status || "sent",
          }
          return updated
        }

        isDuplicate = nextMessages.some((msg) => {
          if (newMessage.whatsapp_message_id && msg.whatsapp_message_id) {
            return msg.whatsapp_message_id === newMessage.whatsapp_message_id
          }

          const sameContent =
            (newMessage.answer && msg.answer && msg.answer === newMessage.answer) ||
            (newMessage.content && msg.content && msg.content === newMessage.content)

          if (sameContent) {
            const msgTime = new Date(msg.created_at).getTime()
            const newMsgTime = new Date(newMessage.created_at).getTime()
            return Math.abs(newMsgTime - msgTime) < 1000
          }

          return false
        })

        if (isDuplicate) return nextMessages
        return [...nextMessages, newMessage]
      })

      if (isDuplicate) return
      setLastMessageId(newMessage.id)
    }

    window.addEventListener("newMessageReceived", handleNewMessage as unknown as EventListener)

    const handleStatusUpdate = (event: CustomEvent) => {
      const { message_id, status } = event.detail
      if (message_id && status) {
        updateMessagesAndSync((prev) => {
          return (prev || []).map((msg) =>
            msg.whatsapp_message_id === message_id ? { ...msg, status } : msg
          )
        })
      }
    }

    window.addEventListener("messageStatusUpdate", handleStatusUpdate as unknown as EventListener)

    const handleConnectionChange = (event: CustomEvent) => {
      if (event.detail.status === "connected") {
        setIsConnected(true)
      } else if (event.detail.status === "disconnected") {
        setIsConnected(false)
      }
    }

    window.addEventListener("websocketConnectionChange", handleConnectionChange as EventListener)

    return () => {
      window.removeEventListener("newMessageReceived", handleNewMessage as unknown as EventListener)
      window.removeEventListener("messageStatusUpdate", handleStatusUpdate as unknown as EventListener)
      window.removeEventListener("websocketConnectionChange", handleConnectionChange as unknown as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages, shouldAutoScroll])

  // Load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!conversation || !fetchOlderMessages || isLoadingOlderMessages) return

    const customerNumber = conversation.customer_number || conversation.recipient_id
    if (!customerNumber) return

    const scrollContainer = scrollAreaRef.current
    if (!scrollContainer) return

    const previousScrollHeight = scrollContainer.scrollHeight
    const previousScrollTop = scrollContainer.scrollTop

    try {
      const olderMessages = await fetchOlderMessages(customerNumber)

      if (olderMessages && olderMessages.length > 0) {
        updateMessagesAndSync((prev) => [...olderMessages, ...(prev || [])])

        requestAnimationFrame(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight
            const heightDifference = newScrollHeight - previousScrollHeight
            scrollContainer.scrollTop = previousScrollTop + heightDifference
          }
        })
      }
    } catch (error) {
      logger.error("Failed to load older messages", { error: error instanceof Error ? error.message : String(error) })
      toast({
        description: "Failed to load older messages",
        variant: "destructive",
        duration: 3000,
      })
    }
  }, [conversation, fetchOlderMessages, isLoadingOlderMessages, toast, updateMessagesAndSync])

  const handleScroll = () => {
    if (!scrollAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100
    setShouldAutoScroll(isScrolledToBottom)

    const isNearTop = scrollTop < 200
    if (
      isNearTop &&
      !isLoadingOlderMessages &&
      hasMoreMessages &&
      fetchOlderMessages &&
      conversation &&
      !isLoadingMessages
    ) {
      loadOlderMessages()
    }

    if (conversation && onScrollPositionChange) {
      if (scrollUpdateFrameRef.current) {
        cancelAnimationFrame(scrollUpdateFrameRef.current)
      }
      scrollUpdateFrameRef.current = requestAnimationFrame(() => {
        onScrollPositionChange(conversation.id, scrollTop)
      })
    }
  }

  useEffect(() => {
    return () => {
      if (scrollUpdateFrameRef.current) {
        cancelAnimationFrame(scrollUpdateFrameRef.current)
      }
    }
  }, [])

  // Refresh messages from server
  const refreshMessages = useCallback(async () => {
    if (!conversation || !fetchMessages) return

    setIsRefreshing(true)
    try {
      const allMessages = await fetchMessages(conversation.customer_number || conversation.recipient_id)

      if (allMessages && allMessages.length > 0) {
        const highestNewId = Math.max(...allMessages.map((msg) => msg.id))

        if (lastMessageId === null) {
          setMessagesAndSync(allMessages)
          setLastMessageId(highestNewId)
        } else if (highestNewId > lastMessageId) {
          const actualNewMessages = allMessages.filter((msg) => msg.id > lastMessageId)

          if (actualNewMessages.length > 0) {
            updateMessagesAndSync((prev) => {
              const updatedMessages = [...(prev || [])]

              actualNewMessages.forEach(newMessage => {
                const pendingIndex = updatedMessages.findIndex((msg) => {
                  if (!msg.pending) return false
                  if (newMessage.sender === 'human') {
                    return msg.answer && newMessage.answer &&
                           msg.answer.trim() === newMessage.answer.trim()
                  }
                  return msg.content && newMessage.content &&
                         msg.content.trim() === newMessage.content.trim()
                })

                if (pendingIndex !== -1) {
                  updatedMessages[pendingIndex] = {
                    ...newMessage,
                    pending: false,
                    status: newMessage.status || "sent",
                  }
                } else {
                  const isDuplicate = updatedMessages.some(msg =>
                    msg.id === newMessage.id ||
                    (msg.whatsapp_message_id && msg.whatsapp_message_id === newMessage.whatsapp_message_id)
                  )
                  if (!isDuplicate) {
                    updatedMessages.push(newMessage)
                  }
                }
              })

              return updatedMessages
            })
            setLastMessageId(highestNewId)
          }
        }
      }
    } catch (error) {
      logger.error("Error fetching new messages", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsRefreshing(false)
    }
  }, [conversation, fetchMessages, lastMessageId, setMessagesAndSync, updateMessagesAndSync])

  // Polling for messages
  useEffect(() => {
    if (!conversation || !fetchMessages || isAiSupport || isLoadingMessages) return

    const initialTimer = setTimeout(() => {
      refreshMessages()
    }, 1000)

    const pollInterval = setInterval(() => {
      refreshMessages()
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(pollInterval)
    }
  }, [conversation, fetchMessages, isAiSupport, isLoadingMessages, refreshMessages])

  // Optimistic UI on message send
  const handleMessageSent = useCallback(
    (newMessageContent: string, mediaUrl?: string, mediaType?: string) => {
      if (!conversation) return
      const tempId = -(Date.now() + Math.random() * 1000)
      const optimisticMessage = {
        id: tempId,
        answer: newMessageContent,
        sender: "human",
        created_at: new Date().toISOString(),
        read: false,
        content: null,
        media: mediaUrl || null,
        type: mediaType || "text",
        status: "sending" as const,
        pending: true,
      }
      updateMessagesAndSync((prev) => [...(prev || []), optimisticMessage])
      setShouldAutoScroll(true)
      return optimisticMessage.id
    },
    [conversation, updateMessagesAndSync],
  )

  const handleMessageSendSuccess = useCallback(
    (tempId: number, realMessage: any) => {
      updateMessagesAndSync((prev) =>
        (prev || []).map((msg) => {
          if (msg.id === tempId && msg.pending) {
            return { ...realMessage, pending: false, status: realMessage.status || "sent" }
          }
          return msg
        }),
      )
    },
    [updateMessagesAndSync],
  )

  const handleMessageSendFailure = useCallback(
    (tempId: number) => {
      updateMessagesAndSync((prev) =>
        (prev || []).map((msg) => {
          if (msg.id === tempId && msg.pending) {
            return { ...msg, status: "failed" as const, pending: false }
          }
          return msg
        }),
      )
    },
    [updateMessagesAndSync],
  )

  const handleRetryMessage = useCallback(
    (messageId: number) => {
      const failedMessage = currentMessages?.find((msg) => msg.id === messageId && msg.status === "failed")
      if (!failedMessage) return

      const messageContent = failedMessage.answer || failedMessage.content || ""
      updateMessagesAndSync((prev) => (prev || []).filter((msg) => msg.id !== messageId))

      window.dispatchEvent(
        new CustomEvent("retryMessage", {
          detail: {
            content: messageContent,
            mediaUrl: failedMessage.media,
            mediaType: failedMessage.type,
          },
        })
      )
    },
    [currentMessages, updateMessagesAndSync],
  )

  // Filter out standalone reaction messages from display
  const displayMessages = useMemo(() => {
    return (currentMessages ?? []).filter((msg) => {
      const igType = detectInstagramMessageType(msg.content)
      return !igType || igType.type !== "reaction"
    })
  }, [currentMessages])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
            <Image src="/instagram.png" alt="Instagram" width={48} height={48} className="object-contain opacity-40" />
          </div>
          <p className="text-[14px] text-[#8E8E8E]">Select a conversation to view messages</p>
        </div>
      </div>
    )
  }

  const groupMessagesByDate = (messages: Conversation["messages"]) => {
    const groups: { [key: string]: Conversation["messages"] } = {}
    const sortedMessages = [...(messages ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    sortedMessages.forEach((message) => {
      const date = format(parseISO(message.created_at), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  }

  const renderDateSeparator = (date: string) => {
    const messageDate = parseISO(date)
    let dateString
    if (isToday(messageDate)) {
      dateString = "Today"
    } else if (isYesterday(messageDate)) {
      dateString = "Yesterday"
    } else {
      dateString = format(messageDate, "MMMM d, yyyy")
    }
    return (
      <div className="ig-timestamp-separator">
        {dateString}
      </div>
    )
  }

  const getFileIcon = (mimeType = "") => {
    if (mimeType.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />
    if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5 text-green-500" />
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const groupedMessages = groupMessagesByDate(displayMessages)

  const handleExport = (format: "pdf" | "csv") => {
    switch (format) {
      case "pdf":
        exportToPDF({ ...conversation, messages: currentMessages })
        break
      case "csv":
        exportToCSV({ ...conversation, messages: currentMessages })
        break
    }
  }

  const handleExportContacts = (format: "pdf" | "csv") => {
    switch (format) {
      case "pdf":
        exportContactsToPDF(conversations)
        break
      case "csv":
        exportContactsToCSV(conversations)
        break
    }
  }

  /** Render Instagram-specific message types */
  const renderInstagramSpecialMessage = (msg: ChatMessage) => {
    const igType = detectInstagramMessageType(msg.content)
    if (!igType) return null

    if (igType.type === "story_reply") {
      return (
        <div className="ig-message-bubble ig-message-customer">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] flex items-center justify-center">
              <span className="text-white text-[8px]">S</span>
            </div>
            <span className="text-[10px] font-medium text-gray-500">Replied to your story</span>
          </div>
          <div className="text-sm">{formatMessage(igType.text)}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )
    }

    if (igType.type === "story_mention") {
      return (
        <div className="ig-message-bubble ig-message-customer">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] flex items-center justify-center">
              <span className="text-white text-[8px]">@</span>
            </div>
            <span className="text-sm text-gray-700">Mentioned you in their story</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )
    }

    if (igType.type === "shared_post" || igType.type === "shared_media") {
      return (
        <div className="ig-message-bubble ig-message-customer">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <FileImage className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-sm text-gray-600">{igType.text || "Shared a post"}</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#DBDBDB]">
        <ConversationHeader
          conversation={conversation}
          phoneNumber={phoneNumber}
          instagramBusinessAccountId={instagramBusinessAccountId}
          onAiSupportChange={(isActive) => setIsAiSupport(isActive)}
        />
      </div>

      {/* WebSocket handler uses instagram_page_id as phoneNumber */}
      {conversation && (
        <WebSocketHandler
          customerNumber={conversation.customer_number || conversation.recipient_id}
          phoneNumber={phoneNumber}
        />
      )}

      {/* Toolbar */}
      <div className="bg-white border-b border-[#DBDBDB] px-3 py-2 flex items-center justify-end gap-2">
        {!isAiSupport && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <span
              className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}
            ></span>
            <span className="text-[11px] font-medium">
              {isConnected ? "Live" : "Connecting..."}
            </span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="font-medium text-xs" disabled>
              Conversation
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("pdf")}>
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("csv")}>
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Export as CSV</span>
            </DropdownMenuItem>
            <div className="h-px bg-muted my-1" />
            <DropdownMenuItem className="font-medium text-xs" disabled>
              Contacts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExportContacts("pdf")}>
              <FolderDown className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExportContacts("csv")}>
              <FolderDown className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs">Export as CSV</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-white"
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        {isLoadingMessages ? (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex justify-center">
              <span className="text-xs font-medium text-gray-500">Loading messages...</span>
            </div>
            {messageSkeletons.map((skeleton, index) => (
              <div
                key={`${skeleton.align}-${index}`}
                className={cn("flex", skeleton.align === "right" ? "justify-end" : "justify-start")}
              >
                <Skeleton className={cn("h-12 rounded-2xl", skeleton.width)} />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn("flex flex-col gap-2 transition-opacity duration-300", isInitialLoad ? "opacity-0" : "opacity-100")}>
            {isLoadingOlderMessages && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span>Loading older messages...</span>
                </div>
              </div>
            )}

            {!isLoadingOlderMessages && hasMoreMessages && displayMessages && displayMessages.length > 0 && (
              <div className="flex justify-center py-2">
                <button
                  onClick={loadOlderMessages}
                  className="text-xs text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                >
                  Load older messages
                </button>
              </div>
            )}

            {Object.entries(groupedMessages)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, messages]) => (
                <div key={date}>
                  {renderDateSeparator(date)}
                  {(messages ?? []).map((message, messageIndex) => {
                    const contentMedia = message.content ? extractMedia(message.content) : null
                    const contentHasMedia = contentMedia?.type && contentMedia?.url
                    const messageKey =
                      message.id ??
                      message.whatsapp_message_id ??
                      `${message.created_at ?? "unknown"}-${messageIndex}`

                    // Check for Instagram special message types
                    const specialRendering = renderInstagramSpecialMessage(message)

                    return (
                      <div key={messageKey} className="flex flex-col mb-3">
                        {/* Instagram special messages */}
                        {specialRendering && specialRendering}

                        {/* Regular customer messages (content field) */}
                        {message.content && !specialRendering && (() => {
                          return (
                            <div
                              className={cn(
                                "ig-message-bubble ig-message-customer",
                                !expandedMessages.includes(message.id) && "collapsed",
                              )}
                            >
                              <div className="text-sm">
                                {contentHasMedia ? (
                                  <>
                                    {contentMedia?.type === "audio" && contentMedia?.url && <AudioPlayer src={contentMedia.url} />}
                                    {contentMedia?.type === "image" && contentMedia?.url && (
                                      <ImagePreview src={contentMedia.url || "/placeholder.svg"} />
                                    )}
                                    {contentMedia?.type === "video" && contentMedia?.url && <VideoPlayer src={contentMedia.url} />}
                                    {contentMedia?.displayText && contentMedia.displayText.trim() && (
                                      <div className="mt-2">{formatMessage(contentMedia.displayText)}</div>
                                    )}
                                  </>
                                ) : (
                                  formatMessage(message.content)
                                )}
                              </div>
                              {message.reaction?.emoji && (
                                <span className="ig-reaction-overlay">{message.reaction.emoji}</span>
                              )}
                            </div>
                          )
                        })()}

                        {/* Business/AI responses (answer field) */}
                        {message.answer && (() => {
                          return (
                            <div
                              className={cn(
                                "ig-message-bubble",
                                message.sender === "ai" ? "ig-message-assistant" : "ig-message-human",
                                message.status === "failed" && "!bg-red-100 !text-red-700",
                              )}
                            >
                              {message.status === "failed" && (
                                <div className="text-[10px] font-medium mb-1 flex items-center gap-1">
                                  <span>Failed to send</span>
                                  <button
                                    onClick={() => handleRetryMessage(message.id)}
                                    className="underline ml-1"
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}
                              <div className="text-sm">{formatMessage(message.answer)}</div>
                              {message.sender === "human" && message.pending && (
                                <div className="flex justify-end mt-0.5">
                                  <MessageStatus
                                    status="sending"
                                    className="text-white/60"
                                  />
                                </div>
                              )}
                              {message.reaction?.emoji && (
                                <span className="ig-reaction-overlay">{message.reaction.emoji}</span>
                              )}
                            </div>
                          )
                        })()}

                        {/* Media messages */}
                        {message.media && (() => {
                          const isCustomerMedia = message.content != null
                          return (
                            <div
                              className={cn(
                                "max-w-[65%] mb-0.5",
                                isCustomerMedia ? "self-start" : "self-end",
                              )}
                            >
                              <div className="rounded-[18px] overflow-hidden">
                                {message.type === "image" ? (
                                  <Image
                                    src={message.media || "/placeholder.svg"}
                                    alt="Image"
                                    className="w-full h-auto"
                                  />
                                ) : (
                                  <div className={cn(
                                    "flex items-center gap-2 p-3 rounded-[18px]",
                                    isCustomerMedia ? "bg-[#EFEFEF]" : "bg-gradient-to-b from-[#8B2FB8] via-[#6758CD] to-[#5974DB] text-white"
                                  )}>
                                    {getFileIcon(message.type)}
                                    <span className="text-sm truncate">Attachment</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </div>
              ))}
            {(displayMessages?.length ?? 0) === 0 && (
              <div className="flex items-center justify-center h-40">
                <span className="px-4 py-1 text-xs font-medium text-gray-400 bg-white rounded-full shadow-sm">
                  No Messages Yet
                </span>
              </div>
            )}
            <div className="h-4" ref={dummyRef} />
            <ScrollToBottomButton targetRef={dummyRef} threshold={150} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-[#DBDBDB]">
        <InstagramMessageInput
          customerNumber={conversation.customer_number || conversation.recipient_id}
          instagramBusinessAccountId={instagramBusinessAccountId}
          organizationId={organizationId}
          onMessageSent={handleMessageSent}
          onMessageSendSuccess={handleMessageSendSuccess}
          onMessageSendFailure={handleMessageSendFailure}
          onOpenCannedResponses={() => setShowCannedResponses(true)}
        />
      </div>

      {/* Canned responses dialog */}
      <CannedResponsesDialog
        open={showCannedResponses}
        onOpenChange={setShowCannedResponses}
        organizationId={organizationId}
        onInsert={handleCannedResponseInsert}
      />
    </div>
  )
}
