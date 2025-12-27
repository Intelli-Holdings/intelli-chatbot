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
    setCurrentMessages((prev) => {
      const nextMessages = (prev || []).map((msg) =>
        msg.id === message.id
          ? {
              ...msg,
              reaction: newEmoji ? { emoji: newEmoji, created_at: new Date().toISOString() } : undefined,
            }
          : msg,
      )
      if (onMessagesUpdate && conversation) {
        onMessagesUpdate(conversation.id, nextMessages)
      }
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
      setCurrentMessages((prev) => {
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
        if (onMessagesUpdate && conversation) {
          onMessagesUpdate(conversation.id, nextMessages)
        }
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
    if (!conversation) return

    const isSameConversation = lastConversationIdRef.current === conversation.id
    if (isSameConversation) {
      const incomingMessages = conversation.messages ?? []
      if (incomingMessages.length > 0 && incomingMessages !== currentMessages) {
        setCurrentMessages(incomingMessages)
        setLastMessageId(
          incomingMessages.length > 0 ? Math.max(...incomingMessages.map((msg) => msg.id)) : null,
        )
      }
      return
    }

    lastConversationIdRef.current = conversation.id
    let isActive = true
    setIsInitialLoad(true)
    setShouldAutoScroll(initialScrollTop === null)

    const existingMessages = conversation.messages ?? []
    if (existingMessages.length > 0) {
      setCurrentMessages(existingMessages)
      setLastMessageId(Math.max(...existingMessages.map((msg) => msg.id)))
      setIsFetchingMessages(false)
      return () => {
        isActive = false
      }
    }

    setCurrentMessages([])
    setLastMessageId(null)

    if (fetchMessages && initialFetchEnabled) {
      setIsFetchingMessages(true)
      const loadMessages = async () => {
        try {
          const messages = await fetchMessages(conversation.customer_number || conversation.recipient_id)
          if (!isActive) return
          setCurrentMessages(messages)
          setLastMessageId((messages?.length ?? 0) > 0 ? Math.max(...(messages ?? []).map((msg) => msg.id)) : null)
          if (onMessagesUpdate) {
            onMessagesUpdate(conversation.id, messages)
          }
        } catch (error) {
          if (!isActive) return
          console.error("Failed to fetch messages for conversation:", error)
          setCurrentMessages([])
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
  }, [conversation, currentMessages, fetchMessages, initialFetchEnabled, initialScrollTop, onMessagesUpdate])

  useEffect(() => {
    if (isLoadingMessages) return
    const timer = setTimeout(() => setIsInitialLoad(false), 150)
    return () => clearTimeout(timer)
  }, [isLoadingMessages])

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
    const activeConversationId = conversation?.id ?? null
    const handleNewMessage = (event: CustomEvent) => {
      const newMessage = event.detail.message
      console.log("New message received:", newMessage)
      if (newMessage) {
        setCurrentMessages((prev) => {
          const nextMessages = [...(prev || []), newMessage]
          if (activeConversationId && onMessagesUpdate) {
            onMessagesUpdate(activeConversationId, nextMessages)
          }
          return nextMessages
        })
        setLastMessageId(newMessage.id)
      }
    }

    window.addEventListener("newMessageReceived", handleNewMessage as unknown as EventListener)

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
      window.removeEventListener("websocketConnectionChange", handleConnectionChange as unknown as EventListener)
    }
  }, [conversation?.id, onMessagesUpdate])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages, shouldAutoScroll])

  const handleScroll = () => {
    if (!scrollAreaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100
    setShouldAutoScroll(isScrolledToBottom)

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
          setCurrentMessages(allMessages)
          setLastMessageId(highestNewId)
          if (onMessagesUpdate) {
            onMessagesUpdate(conversation.id, allMessages)
          }
        } else if (highestNewId > lastMessageId) {
          // There are new messages - find only the new ones
          const actualNewMessages = allMessages.filter((msg) => msg.id > lastMessageId)

          if (actualNewMessages.length > 0) {
            setCurrentMessages((prev) => {
              const nextMessages = [...(prev || []), ...actualNewMessages]
              if (onMessagesUpdate) {
                onMessagesUpdate(conversation.id, nextMessages)
              }
              return nextMessages
            })
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
  }, [conversation, fetchMessages, lastMessageId, onMessagesUpdate, toast])

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
    (newMessageContent: string) => {
      if (!conversation) return
      const optimisticMessage = {
        id: Date.now(),
        answer: newMessageContent,
        sender: "customer",
        created_at: new Date().toISOString(),
        read: false,
        content: null,
        media: null,
        type: "text",
      }
      setCurrentMessages((prev) => {
        const nextMessages = [...(prev || []), optimisticMessage]
        if (onMessagesUpdate) {
          onMessagesUpdate(conversation.id, nextMessages)
        }
        return nextMessages
      })
      setLastMessageId(optimisticMessage.id)
      setShouldAutoScroll(true)
    },
    [conversation, onMessagesUpdate],
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
      <div className="bg-[#f0f2f5] border-b border-[#e9edef] px-3 py-2 flex items-center gap-3">
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

        <ResolveReminder className="flex-1" />

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
            {Object.entries(groupedMessages)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, messages]) => (
                <div className="" key={date}>
                  {renderDateSeparator(date)}
                  {(messages ?? []).map((message) => {
                    // Extract media from content if it exists
                    const contentMedia = message.content ? extractMedia(message.content) : null
                    const contentHasMedia = contentMedia?.type && contentMedia?.url

                    return (
                      <div key={message.id} className="flex flex-col mb-4">
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
                  )}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={`message-tail ${
                      message.sender === "ai" ? "message-tail-right-assistant" : "message-tail-right-human"
                    }`}
                  />
                  <div className="text-sm">{formatMessage(message.answer)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {/* Message status indicator for sent messages */}
                    {(message.sender === "customer" || message.sender === "human") && (
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
              {message.media && (
                <div
                  className={cn("message-bubble message-customer group", message.reaction?.emoji && "has-reaction")}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="message-tail message-tail-left" />
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
        />
      </div>
    </div>
  )
}
