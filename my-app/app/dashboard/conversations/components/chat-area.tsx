"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import MessageInput from "./messageInput"
import { extractMedia } from "@/utils/extractMedia"
import { AudioPlayer, VideoPlayer, ImagePreview, formatMessage } from "@/utils/formatMessage"
import type { Conversation, ChatMessage } from "./types"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import ConversationHeader from "./conversationsHeader"
import { ScrollToBottomButton } from "@/app/dashboard/conversations/components/scroll-to-bottom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FolderDown, File, FileImage, Music, Video, FileText } from "lucide-react"
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from "@/utils/exportUtils"
import "./message-bubble.css"
import ResolveReminder from "@/components/resolve-reminder"
import { WebSocketHandler } from "@/components/websocket-handler"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ReactionPicker } from "@/components/reaction-picker"
import { MessageStatus } from "@/app/dashboard/conversations/components/message-status"

// Extended interface to include polling configuration
interface ConversationViewProps {
  conversation: Conversation | null
  conversations: Conversation[]
  phoneNumber: string
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

// Helper types for media previews
interface MediaPreviewState {
  isOpen: boolean
  url: string
  type: string
  filename?: string
}

export default function ChatArea({
  conversation,
  conversations,
  phoneNumber,
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
}: ConversationViewProps) {
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
  const params = useParams()
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

  // Update refs when props change
  useEffect(() => {
    conversationIdRef.current = conversation?.id ?? null
    onMessagesUpdateRef.current = onMessagesUpdate
  }, [conversation?.id, onMessagesUpdate])

  const setMessagesState = useCallback((messages: Conversation["messages"]) => {
    const nextMessages = messages ?? []
    // Update ref immediately to prevent race conditions in duplicate detection
    currentMessagesRef.current = nextMessages
    setCurrentMessages(nextMessages)
  }, [])

  const syncMessagesToParent = useCallback((messages: Conversation["messages"]) => {
    const nextMessages = messages ?? []
    const activeConversationId = conversationIdRef.current
    if (!activeConversationId || !onMessagesUpdateRef.current) return
    onMessagesUpdateRef.current(activeConversationId, nextMessages)
  }, [])

  const setMessagesAndSync = useCallback(
    (messages: Conversation["messages"]) => {
      const nextMessages = messages ?? []
      setMessagesState(nextMessages)
      syncMessagesToParent(nextMessages)
    },
    [setMessagesState, syncMessagesToParent],
  )

  const updateMessagesAndSync = useCallback(
    (updater: (prev: Conversation["messages"]) => Conversation["messages"]) => {
      const prevMessages = currentMessagesRef.current ?? []
      const nextMessages = updater(prevMessages) ?? []
      setMessagesState(nextMessages)
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

  const handleReactionSelect = async (message: ChatMessage, emoji: string, currentReaction?: string) => {
    if (!conversation) return

    // Check if message has WhatsApp message ID
    if (!message.whatsapp_message_id) {
      toast({
        description: "Cannot react to this message - WhatsApp message ID not found",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Check if organizationId is available
    if (!organizationId) {
      toast({
        description: "Organization ID is required to send reactions",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // If clicking the same emoji, remove the reaction
    const isRemoving = currentReaction === emoji
    const newEmoji = isRemoving ? "" : emoji

    // Optimistic update
    updateMessagesAndSync((prev) => {
      const nextMessages = (prev || []).map((msg) =>
        msg.id === message.id
          ? {
              ...msg,
              reaction: newEmoji ? { emoji: newEmoji, created_at: new Date().toISOString() } : undefined,
            }
          : msg,
      )
      return nextMessages
    })

    try {
      // Send reaction to WhatsApp API
      const response = await fetch("/api/whatsapp/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientNumber: conversation.customer_number || conversation.recipient_id,
          messageId: message.whatsapp_message_id,
          emoji: newEmoji,
          organizationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("WhatsApp API error:", errorData)
        throw new Error(errorData.error || "Failed to send reaction")
      }

      toast({
        description: isRemoving ? "Reaction removed" : "Reaction sent",
        duration: 2000,
      })
    } catch (error) {
      console.error("Failed to send reaction:", error)

      // Revert optimistic update on error
      updateMessagesAndSync((prev) => {
        const nextMessages = (prev || []).map((msg) =>
          msg.id === message.id
            ? {
                ...msg,
                reaction: currentReaction
                  ? { emoji: currentReaction, created_at: new Date().toISOString() }
                  : undefined,
              }
            : msg,
        )
        return nextMessages
      })

      toast({
        description: error instanceof Error ? error.message : "Failed to send reaction. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const renderReaction = (message: ChatMessage) => {
    if (!message.reaction?.emoji) return null

    return (
      <button
        className="message-reaction"
        title={`Reacted with ${message.reaction.emoji}. Click to change or remove.`}
        onClick={() => handleReactionSelect(message, message.reaction!.emoji, message.reaction!.emoji)}
      >
        {message.reaction.emoji}
      </button>
    )
  }

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
          console.error("Failed to fetch messages for conversation:", error)
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

  // Reset unread messages when conversation is viewed (mimicking WhatsApp Web behavior)
  useEffect(() => {
    if (!conversation || isLoadingMessages) return
    if ((conversation.unread_messages || 0) > 0) {
      // Add a small delay to ensure the user has actually "viewed" the conversation
      const resetTimer = setTimeout(async () => {
        try {
          await fetch(`/api/appservice/reset/unread_messages/${phoneNumber}/${conversation.customer_number}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          // Dispatch a custom event to notify other components that unread count has been reset
          window.dispatchEvent(
            new CustomEvent("unreadMessagesReset", {
              detail: {
                customerNumber: conversation.customer_number,
                phoneNumber: phoneNumber,
              },
            }),
          )
        } catch (error) {
          console.error("Failed to reset unread messages:", error)
        }
      }, 1000) // 1 second delay to ensure user has viewed the chat

      return () => clearTimeout(resetTimer)
    }
  }, [conversation, phoneNumber, isLoadingMessages])

  // Listen for AI support changes from the header component
  useEffect(() => {
    const handleAiSupportChange = (event: CustomEvent) => {
      const newIsAiSupport = event.detail.isAiSupport
      console.log(`AI Support changed to: ${newIsAiSupport}`)
      setIsAiSupport(newIsAiSupport)

      // WebSocket connection is now handled by the WebSocketHandler component
      // We just need to update the state here
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
      console.log("New message received:", newMessage)
      if (newMessage) {
        updateMessagesAndSync((messages) => {
          const nextMessages = messages || []

          // Check if this is a real message replacing an optimistic one
          // Look for pending messages sent within last 10 seconds
          const recentPendingIndex = nextMessages.findIndex((msg) => {
            if (!msg.pending) return false

            // For business messages (sender: human), check if content matches
            if (newMessage.sender === 'human') {
              // Check if answer content matches (business messages use 'answer' field)
              const answerMatches =
                msg.answer && newMessage.answer &&
                (msg.answer.trim() === newMessage.answer.trim() || msg.answer.includes(newMessage.answer))

              // Check if sent recently (within 10 seconds)
              const msgTime = new Date(msg.created_at).getTime()
              const newMsgTime = new Date(newMessage.created_at).getTime()
              const timeDiff = Math.abs(newMsgTime - msgTime)
              const sentRecently = timeDiff < 10000

              return answerMatches && sentRecently
            }

            // For customer messages, check content field
            const contentMatches =
              (msg.content && newMessage.content &&
               (msg.content.trim() === newMessage.content.trim() || msg.content.includes(newMessage.content)))

            // Check if sent recently (within 10 seconds)
            const msgTime = new Date(msg.created_at).getTime()
            const newMsgTime = new Date(newMessage.created_at).getTime()
            const timeDiff = Math.abs(newMsgTime - msgTime)
            const sentRecently = timeDiff < 10000

            return contentMatches && sentRecently
          })

          if (recentPendingIndex !== -1) {
            // Replace optimistic message with real one
            const updated = [...nextMessages]
            updated[recentPendingIndex] = {
              ...newMessage,
              pending: false,
              status: newMessage.status || "sent",
            }
            console.log("Replaced optimistic message with real message")
            return updated
          } else {
            // Check if message already exists (prevent duplicates)
            // Check by whatsapp_message_id if available, or by content and timestamp
            const isDuplicate = nextMessages.some((msg) => {
              // Check by WhatsApp message ID
              if (newMessage.whatsapp_message_id && msg.whatsapp_message_id) {
                return msg.whatsapp_message_id === newMessage.whatsapp_message_id
              }

              // Check by content and timestamp (within 1 second)
              const sameContent =
                (newMessage.answer && msg.answer && msg.answer === newMessage.answer) ||
                (newMessage.content && msg.content && msg.content === newMessage.content)

              if (sameContent) {
                const msgTime = new Date(msg.created_at).getTime()
                const newMsgTime = new Date(newMessage.created_at).getTime()
                const timeDiff = Math.abs(newMsgTime - msgTime)
                return timeDiff < 1000 // Within 1 second
              }

              return false
            })

            if (isDuplicate) {
              console.log("Duplicate message detected, skipping")
              return nextMessages
            }

            // Add as new message
            return [...nextMessages, newMessage]
          }
        })
        setLastMessageId(newMessage.id)
      }
    }

    window.addEventListener("newMessageReceived", handleNewMessage as unknown as EventListener)

    // Listen for message status updates from WebSocketHandler
    const handleStatusUpdate = (event: CustomEvent) => {
      const { message_id, status } = event.detail
      console.log("Status update received:", { message_id, status })

      if (message_id && status) {
        updateMessagesAndSync((prev) => {
          const updated = (prev || []).map((msg) => {
            if (msg.whatsapp_message_id === message_id) {
              return { ...msg, status: status }
            }
            return msg
          })

          return updated
        })
      }
    }

    window.addEventListener("messageStatusUpdate", handleStatusUpdate as unknown as EventListener)

    // Listen for connection status changes
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
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages, shouldAutoScroll])

  // Load older messages (for pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!conversation || !fetchOlderMessages || isLoadingOlderMessages) return

    const customerNumber = conversation.customer_number || conversation.recipient_id
    if (!customerNumber) return

    // Save current scroll position before loading
    const scrollContainer = scrollAreaRef.current
    if (!scrollContainer) return

    const previousScrollHeight = scrollContainer.scrollHeight
    const previousScrollTop = scrollContainer.scrollTop

    try {
      const olderMessages = await fetchOlderMessages(customerNumber)

      if (olderMessages && olderMessages.length > 0) {
        // Prepend older messages to current messages
        updateMessagesAndSync((prev) => [...olderMessages, ...(prev || [])])

        // Restore scroll position after DOM update
        requestAnimationFrame(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight
            const heightDifference = newScrollHeight - previousScrollHeight
            scrollContainer.scrollTop = previousScrollTop + heightDifference
          }
        })
      }
    } catch (error) {
      console.error("Failed to load older messages:", error)
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

    // Load older messages when scrolling near the top
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

  // Function to fetch and merge new messages from the server
  const refreshMessages = useCallback(async () => {
    if (!conversation || !fetchMessages) return

    setIsRefreshing(true)
    try {
      const allMessages = await fetchMessages(conversation.customer_number || conversation.recipient_id)

      if (allMessages && allMessages.length > 0) {
        const highestNewId = Math.max(...allMessages.map((msg) => msg.id))

        if (lastMessageId === null) {
          // First time loading - set all messages
          setMessagesAndSync(allMessages)
          setLastMessageId(highestNewId)
        } else if (highestNewId > lastMessageId) {
          // There are new messages - find only the new ones
          const actualNewMessages = allMessages.filter((msg) => msg.id > lastMessageId)

          if (actualNewMessages.length > 0) {
            updateMessagesAndSync((prev) => [...(prev || []), ...actualNewMessages])
            setLastMessageId(highestNewId)
            toast({
              description: `${actualNewMessages.length} new message${actualNewMessages.length > 1 ? "s" : ""} received`,
              duration: 2000,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching new messages:", error)
      toast({
        description: "Failed to fetch new messages",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [conversation, fetchMessages, lastMessageId, toast, setMessagesAndSync, updateMessagesAndSync])

  // Set up polling to fetch latest messages when AI support is not active
  useEffect(() => {
    if (!conversation || !fetchMessages || isAiSupport || isLoadingMessages) return

    // Initial fetch after a short delay to avoid conflicts
    const initialTimer = setTimeout(() => {
      refreshMessages()
    }, 1000)

    // Set up polling every 3 seconds to fetch new messages
    const pollInterval = setInterval(() => {
      refreshMessages()
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(pollInterval)
    }
  }, [conversation, fetchMessages, isAiSupport, isLoadingMessages, refreshMessages])

  // Optimistic UI update on message send
  const handleMessageSent = useCallback(
    (newMessageContent: string, mediaUrl?: string, mediaType?: string) => {
      if (!conversation) return
      // Generate a unique temporary ID that's very unlikely to collide
      // Use negative timestamp to avoid collision with real message IDs
      const tempId = -(Date.now() + Math.random() * 1000)
      const optimisticMessage = {
        id: tempId, // Unique temporary ID
        answer: newMessageContent,
        sender: "human",
        created_at: new Date().toISOString(),
        read: false,
        content: null,
        media: mediaUrl || null,
        type: mediaType || "text",
        status: "sending" as const,
        pending: true, // Flag to identify optimistic messages
      }
      updateMessagesAndSync((prev) => [...(prev || []), optimisticMessage])
      setLastMessageId(optimisticMessage.id)
      setShouldAutoScroll(true)

      return optimisticMessage.id // Return temp ID for tracking
    },
    [conversation, updateMessagesAndSync],
  )

  // Handle message send success - update optimistic message
  const handleMessageSendSuccess = useCallback(
    (tempId: number, realMessage: any) => {
      updateMessagesAndSync((prev) =>
        (prev || []).map((msg) => {
          if (msg.id === tempId && msg.pending) {
            // Replace optimistic message with real one
            return {
              ...realMessage,
              pending: false,
              status: realMessage.status || "sent",
            }
          }
          return msg
        }),
      )
    },
    [updateMessagesAndSync],
  )

  // Handle message send failure
  const handleMessageSendFailure = useCallback(
    (tempId: number) => {
      updateMessagesAndSync((prev) =>
        (prev || []).map((msg) => {
          if (msg.id === tempId && msg.pending) {
            return {
              ...msg,
              status: "failed" as const,
              pending: false,
            }
          }
          return msg
        }),
      )
    },
    [updateMessagesAndSync],
  )

  // Retry failed message
  const handleRetryMessage = useCallback(
    (messageId: number) => {
      const failedMessage = currentMessages?.find((msg) => msg.id === messageId && msg.status === "failed")
      if (!failedMessage) return

      // Extract message content
      const messageContent = failedMessage.answer || failedMessage.content || ""

      // Remove failed message from UI
      updateMessagesAndSync((prev) => (prev || []).filter((msg) => msg.id !== messageId))

      // Trigger resend via MessageInput component
      // We'll dispatch a custom event that MessageInput can listen to
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

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 ">
        <p className="text-muted-foreground">Select a conversation to view messages.</p>
      </div>
    )
  }

  const groupMessagesByDate = (messages: Conversation["messages"]) => {
    const groups: { [key: string]: Conversation["messages"] } = {}

    // Sort messages by created_at to ensure chronological order
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
      <div className="flex justify-center my-3">
        <span className="px-3 py-1.5 text-[11px] font-medium text-[#54656f] bg-white/90 rounded-md shadow-sm">{dateString}</span>
      </div>
    )
  }

  // Get icon based on file type
  const getFileIcon = (mimeType = "") => {
    if (mimeType.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />
    if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5 text-green-500" />
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return <FileText className="h-5 w-5 text-green-600" />
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FileText className="h-5 w-5 text-blue-600" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const groupedMessages = groupMessagesByDate(currentMessages)

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

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#e9edef]">
        <ConversationHeader
          conversation={conversation}
          phoneNumber={phoneNumber}
          onAiSupportChange={(isActive) => setIsAiSupport(isActive)}
        />

      </div>

      {/* Always render WebSocketHandler when conversation exists, regardless of who's handling it */}
      {conversation && (
        <WebSocketHandler
          customerNumber={conversation.customer_number || conversation.recipient_id}
          phoneNumber={phoneNumber}
        />
      )}

      {/* Compact toolbar with connection status, reminder, and export */}
      <div className="bg-[#f0f2f5] border-b border-[#e9edef] px-3 py-2 flex items-center justify-end gap-2">
        {/* WebSocket connection status - show only when human support is active */}
        {!isAiSupport && (
          <div className="flex items-center gap-1.5 text-xs text-[#54656f] shrink-0">
            <span
              className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-[#25d366] animate-pulse" : "bg-orange-500"}`}
            ></span>
            <span className="text-[11px] font-medium">
              {isConnected ? "Live" : "Connecting..."}
            </span>
          </div>
        )}

        <ResolveReminder
          lastCustomerMessageTime={
            currentMessages && currentMessages.length > 0
              ? [...currentMessages]
                  .reverse()
                  .find((msg) => msg.sender === 'customer')
                  ?.created_at
              : undefined
          }
        />

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
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: "url('/original.png?height=500&width=500')",
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
        }}
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
            {/* Loading indicator for older messages */}
            {isLoadingOlderMessages && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span>Loading older messages...</span>
                </div>
              </div>
            )}

            {/* Show "Load more" button if there are more messages but not currently loading */}
            {!isLoadingOlderMessages && hasMoreMessages && currentMessages && currentMessages.length > 0 && (
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
                <div className="" key={date}>
                  {renderDateSeparator(date)}
                  {(messages ?? []).map((message, messageIndex) => {
                    // Extract media from content if it exists
                    const contentMedia = message.content ? extractMedia(message.content) : null
                    const contentHasMedia = contentMedia?.type && contentMedia?.url
                    const messageKey =
                      message.id ??
                      message.whatsapp_message_id ??
                      `${message.created_at ?? "unknown"}-${messageIndex}`

                    return (
                      <div key={messageKey} className="flex flex-col mb-4">
              {message.content && (
                <div
                  className={cn(
                    "message-bubble message-customer group",
                    !expandedMessages.includes(message.id) && "collapsed",
                    message.reaction?.emoji && "has-reaction",
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="message-tail message-tail-left" />
                  {/* Customer badge */}
                  <div className="text-[9px] font-semibold text-gray-600 mb-1">
                    Customer
                  </div>
                  <div className="text-sm">
                    {contentHasMedia ? (
                      <>
                        {contentMedia?.type === "audio" && contentMedia?.url && <AudioPlayer src={contentMedia.url} />}
                        {contentMedia?.type === "image" && contentMedia?.url && (
                          <ImagePreview src={contentMedia.url || "/placeholder.svg"} />
                        )}
                        {contentMedia?.type === "video" && contentMedia?.url && <VideoPlayer src={contentMedia.url} />}
                        {/* Display remaining text if any */}
                        {contentMedia?.displayText && contentMedia.displayText.trim() && (
                          <div className="mt-2">{formatMessage(contentMedia.displayText)}</div>
                        )}
                      </>
                    ) : (
                      formatMessage(message.content)
                    )}
                  </div>
                  <span className="text-[11px] text-[#667781] mt-1 block">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {message.reaction?.emoji && (
                    <span className="text-[11px] text-[#667781] mt-1 block">{message.reaction.emoji}</span>
                  )}
                  {message.whatsapp_message_id && (
                    <div className="absolute -top-3 right-2">
                      <ReactionPicker
                        onReactionSelect={(emoji) => handleReactionSelect(message, emoji, message.reaction?.emoji)}
                        currentReaction={message.reaction?.emoji}
                      />
                    </div>
                  )}
                </div>
              )}

              {message.answer && (
                <div
                  className={cn(
                    "message-bubble group",
                    message.sender === "ai" ? "message-assistant" : "message-human",
                    message.reaction?.emoji && "has-reaction",
                    message.status === "failed" && "border-2 border-red-400 bg-red-50/50",
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={`message-tail ${
                      message.sender === "ai" ? "message-tail-right-assistant" : "message-tail-right-human"
                    }`}
                  />
                  {message.status === "failed" && (
                    <div className="text-[10px] text-red-600 font-medium mb-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>Failed to send</span>
                    </div>
                  )}
                  {/* Sender badge - AI or Human */}
                  <div className={cn(
                    "text-[9px] font-semibold mb-1",
                    message.sender === "ai" ? "text-purple-600" : "text-green-700"
                  )}>
                    {message.sender === "ai" ? "🤖 AI Assistant" : "👤 Business"}
                  </div>
                  <div className="text-sm">{formatMessage(message.answer)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {/* Message status indicator for sent messages (only for human/business messages) */}
                    {message.sender === "human" && (
                      <>
                        <MessageStatus
                          status={message.pending ? 'sending' : message.status || 'delivered'}
                          className="text-[#667781]"
                        />
                        {/* Retry button for failed messages */}
                        {message.status === "failed" && (
                          <button
                            onClick={() => handleRetryMessage(message.id)}
                            className="ml-2 text-[10px] text-red-600 hover:text-red-700 underline"
                            title="Retry sending this message"
                          >
                            Retry
                          </button>
                        )}
                      </>
                    )}
                    {/* AI messages don't need status indicators since they're auto-sent */}
                  </div>
                  {message.reaction?.emoji && (
                    <span className="text-[11px] text-[#667781] mt-1 block">{message.reaction.emoji}</span>
                  )}
                  {message.whatsapp_message_id && (
                    <div className="absolute -top-3 right-2">
                      <ReactionPicker
                        onReactionSelect={(emoji) => handleReactionSelect(message, emoji, message.reaction?.emoji)}
                        currentReaction={message.reaction?.emoji}
                      />
                    </div>
                  )}
                </div>
              )}
              {message.media && (
                <div
                  className={cn(
                    "message-bubble group",
                    message.sender === "customer"
                      ? "message-customer"
                      : message.sender === "ai"
                        ? "message-assistant"
                        : "message-human",
                    message.reaction?.emoji && "has-reaction"
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={
                      message.sender === "customer"
                        ? "message-tail message-tail-left"
                        : message.sender === "ai"
                          ? "message-tail message-tail-right-assistant"
                          : "message-tail message-tail-right-human"
                    }
                  />
                  {/* Sender badge */}
                  {message.sender === "customer" ? (
                    <div className="text-[9px] font-semibold text-gray-600 mb-1">
                      Customer
                    </div>
                  ) : (
                    <div className={cn(
                      "text-[9px] font-semibold mb-1",
                      message.sender === "ai" ? "text-purple-600" : "text-green-700"
                    )}>
                      {message.sender === "ai" ? "🤖 AI Assistant" : "👤 Business"}
                    </div>
                  )}
                  <div className="text-sm cursor-pointer" onClick={() => {}}>
                    <div className="max-w-xs rounded-lg overflow-hidden shadow">
                      {message.type === "image" ? (
                        <Image
                          src={message.media || "/placeholder.svg"}
                          alt="Image"
                          className="w-full h-auto rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                          {getFileIcon(message.type)}
                          <span className="text-sm truncate">Attachment</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {/* Message status indicator for sent media (only for human/business messages) */}
                    {message.sender === "human" && (
                      <MessageStatus
                        status={message.pending ? 'sending' : message.status || 'delivered'}
                        className="text-[#667781]"
                      />
                    )}
                  </div>
                  {message.reaction?.emoji && (
                    <span className="text-[11px] text-[#667781] mt-1 block">{message.reaction.emoji}</span>
                  )}
                  {message.whatsapp_message_id && (
                    <div className="absolute -top-3 right-2">
                      <ReactionPicker
                        onReactionSelect={(emoji) => handleReactionSelect(message, emoji, message.reaction?.emoji)}
                        currentReaction={message.reaction?.emoji}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
                    )
                  })}
                </div>
              ))}
            {(currentMessages?.length ?? 0) === 0 && (
              <div className="flex items-center justify-center h-40">
                <span className="px-4 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  No Messages Yet
                </span>
              </div>
            )}
            <div className="h-4" ref={dummyRef} />
            <ScrollToBottomButton targetRef={dummyRef} threshold={150} />
          </div>
        )}
      </div>
      <div className="p-2 bg-[#f0f2f5] border-t border-[#e9edef]">
        <MessageInput
          customerNumber={conversation.customer_number || conversation.recipient_id}
          phoneNumber={phoneNumber}
          onMessageSent={handleMessageSent}
          onMessageSendSuccess={handleMessageSendSuccess}
          onMessageSendFailure={handleMessageSendFailure}
        />
      </div>
    </div>
  )
}
