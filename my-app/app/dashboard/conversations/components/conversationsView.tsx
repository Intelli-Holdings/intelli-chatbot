"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "./types"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import ConversationHeader from "./conversationsHeader"
import MessageInput from "./messageInput"
import { formatMessage } from "@/utils/formatMessage"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Forward, File, Image, RefreshCw, FileText } from "lucide-react"
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from "@/utils/exportUtils"
import "./message-bubble.css"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { FilePreviewCarousel } from "./file-preview-carousel"

// Extended interface to include polling configuration
interface ConversationViewProps {
  conversation: Conversation | null
  conversations: Conversation[]
  phoneNumber: string
  pollingInterval?: number // Time in ms between polls (default: 3000ms)
  fetchMessages?: (conversationId: string) => Promise<Conversation["messages"]>
}

// Helper types for media previews
interface MediaPreviewState {
  isOpen: boolean
  url: string
  type: string
  filename?: string
}

// Add this interface near the top with other interfaces
interface PreviewState {
  isOpen: boolean;
  attachments: Array<{
    id: string;
    media_url: string;
    media_type: string;
    media_name: string;
    media_mime_type?: string;
  }>;
  initialIndex: number;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  conversations,
  phoneNumber,
  pollingInterval = 3000,
  fetchMessages, // Function to fetch latest messages from your API
}) => {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const dummyRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [lastMessageId, setLastMessageId] = useState<number | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Conversation["messages"]>([])
  const [isPolling, setIsPolling] = useState(true)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [previewState, setPreviewState] = useState<PreviewState>({
    isOpen: false,
    attachments: [],
    initialIndex: 0,
  })

  // Set initial messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setCurrentMessages(conversation.messages)
      setLastMessageId(
        conversation.messages.length > 0 ? Math.max(...conversation.messages.map((msg) => msg.id)) : null,
      )
    }
  }, [conversation])

  const toggleMessage = (messageId: number) => {
    setExpandedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    )
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [shouldAutoScroll])

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100 // Adding buffer
      setShouldAutoScroll(isScrolledToBottom)
    }
  }

  // Function to fetch and merge new messages
  const refreshMessages = useCallback(async () => {
    if (!conversation || !fetchMessages) return

    try {
      const newMessages = await fetchMessages(conversation.id.toString())

      if (newMessages && newMessages.length > 0) {
        // Find the highest message ID from the new messages
        const highestNewId = Math.max(...newMessages.map((msg) => msg.id))

        // If we have new messages
        if (lastMessageId === null || highestNewId > lastMessageId) {
          // Get only the new messages
          const actualNewMessages = newMessages.filter((msg) => lastMessageId === null || msg.id > lastMessageId)

          if (actualNewMessages.length > 0) {
            // Update our messages and last message ID
            setCurrentMessages((prev) => [...prev, ...actualNewMessages])
            setLastMessageId(highestNewId)

            // Play notification sound for new messages
            if (lastMessageId !== null) {
              playNotificationSound()
            }
          }
        }
      }

      if (isManualRefreshing) {
        setIsManualRefreshing(false)
      }
    } catch (error) {
      console.error("Error fetching new messages:", error)
      if (isManualRefreshing) {
        setIsManualRefreshing(false)
      }
    }
  }, [conversation, fetchMessages, lastMessageId, isManualRefreshing])

  // Setup polling
  useEffect(() => {
    const startPolling = () => {
      if (isPolling && conversation) {
        refreshMessages()
        pollingTimeoutRef.current = setTimeout(startPolling, pollingInterval)
      }
    }

    // Clear any existing polling
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }

    // Start new polling if enabled
    if (isPolling && conversation) {
      startPolling()
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [isPolling, conversation, refreshMessages, pollingInterval])

  // Play notification sound for new messages
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3")
      audio.play()
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }

  // Manual refresh handler
  const handleManualRefresh = () => {
    setIsManualRefreshing(true)
    refreshMessages()
  }

  // Toggle polling on/off
  const togglePolling = () => {
    setIsPolling((prev) => !prev)
  }

  // Open media preview
  const openMediaPreview = (attachments: any[], index: number) => {
    setPreviewState({
      isOpen: true,
      attachments,
      initialIndex: index,
    })
  }

  // Close media preview
  const closeMediaPreview = () => {
    setPreviewState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 ">
        <p className="text-muted-foreground">Select a conversation to view messages.</p>
      </div>
    )
  }

  const groupMessagesByDate = (messages: Conversation["messages"]) => {
    const groups: { [key: string]: Conversation["messages"] } = {}
    messages.forEach((message) => {
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
      <div className="flex justify-center my-4">
        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">{dateString}</span>
      </div>
    )
  }

  const getFileIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
        return <Image className="h-5 w-5 text-green-500" />
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-blue-500" />
    }
  }

  // Function to render media preview dialog
  const renderMediaPreviewDialog = () => (
    <FilePreviewCarousel
      isOpen={previewState.isOpen}
      onClose={closeMediaPreview}
      attachments={previewState.attachments}
      initialIndex={previewState.initialIndex}
    />
  )

  // Function to render media content based on media type
  const renderMediaContent = (attachment: any) => {
    // Updated function
    const mimeType =
      attachment.media_mime_type ||
      (attachment.media_type === "image"
        ? "image/jpeg"
        : attachment.media_type === "pdf"
          ? "application/pdf"
          : "application/octet-stream")

    return (
      <div className="flex justify-start mb-2">
        <div className="bg-[#dcf8c6] p-2 rounded-lg shadow-sm max-w-[280px] transition-all hover:shadow-md group">
          <div className="relative">
            {attachment.media_type === "image" ? (
              <img
                src={attachment.media_url || "/placeholder.svg"}
                alt={attachment.media_name}
                className="rounded max-w-[280px] max-h-[280px] object-cover cursor-pointer"
                onClick={() =>
                  openMediaPreview(
                    conversation.attachments || [],
                    conversation.attachments?.findIndex((a) => a.id === attachment.id) || 0,
                  )
                }
              />
            ) : attachment.media_type === "pdf" ? (
              <div
                className="cursor-pointer"
                onClick={() =>
                  openMediaPreview(
                    conversation.attachments || [],
                    conversation.attachments?.findIndex((a) => a.id === attachment.id) || 0,
                  )
                }
              >
                <div className="bg-gray-50 rounded p-2 mb-2">
                  <iframe
                    src={`${attachment.media_url}#view=FitH`}
                    className="w-full h-[150px]"
                    title={attachment.media_name}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.media_name}</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3">
                {getFileIcon(attachment.media_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.media_name}</p>
                  <p className="text-xs text-muted-foreground">{attachment.media_type.toUpperCase()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{format(parseISO(attachment.created_at), "h:mm a")}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.open(attachment.media_url, "_blank")}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/")
      return pathParts[pathParts.length - 1] || "Unknown file"
    } catch {
      return "Unknown file"
    }
  }

  return (
    <div className="flex flex-col h-screen mx-auto py-4 border-l">
      <ConversationHeader conversation={conversation} phoneNumber={phoneNumber} />

      <div className="flex justify-between px-1 py-1 bg-white border-b border-gray-100">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isManualRefreshing ? "animate-spin" : ""}`} />
            {isManualRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePolling}
            className={`ml-2 ${isPolling ? "text-green-600" : "text-gray-500"}`}
          >
            {isPolling ? "Auto-refresh On" : "Auto-refresh Off"}
          </Button>
        </div>

        <div className="flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Forward className="mr-2 h-4 w-4" />
                Export Conversation
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleExport("pdf")}>Share as PDF</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport("csv")}>Share as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Contacts
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleExportContacts("pdf")}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts("csv")}>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                View Attachments
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Attachments</h3>
                  <p className="text-sm text-muted-foreground">All files shared in this conversation</p>
                </div>

                <ScrollArea className="flex-1 p-6">
                  {conversation.attachments?.length ? (
                    <div className="space-y-4">
                      {conversation.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            openMediaPreview(
                              conversation.attachments || [],
                              conversation.attachments?.findIndex((a) => a.id === attachment.id) || 0,
                            )
                          }}
                        >
                          {getFileIcon(attachment.media_type)}
                          <div className="flex-1 min-w-0">
                            <a
                              href={attachment.media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm hover:underline truncate"
                            >
                              {attachment.media_name}
                            </a>
                            <p className="text-xs text-muted-foreground">{attachment.media_type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No attachments in this conversation</div>
                  )}
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-50" onScrollCapture={handleScroll} ref={scrollAreaRef}>
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div className="" key={date}>
              {renderDateSeparator(date)}
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col mb-4">
                  {/* Customer content */}
                  {message.content && (
                    <>
                      {message.media && <div className="flex justify-start mb-2">{renderMediaContent(message)}</div>}
                      <div
                        className={`message-bubble message-customer ${
                          !expandedMessages.includes(message.id) ? "collapsed" : ""
                        }`}
                      >
                        <div className="message-tail message-tail-left" />
                        <div className="text-sm">{formatMessage(message.content)}</div>
                        <span className="text-[10px] text-white/80 mt-1 block">
                          {format(parseISO(message.created_at), "h:mm a")}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Business/AI response */}
                  {message.answer && (
                    <>
                      {message.media && (
                        <div className="flex justify-end mb-2">
                          {renderMediaContent({ ...message, sender: "business" })}
                        </div>
                      )}
                      <div
                        className={`message-bubble ${message.sender === "ai" ? "message-assistant" : "message-human"}`}
                      >
                        <div
                          className={`message-tail ${
                            message.sender === "ai" ? "message-tail-right-assistant" : "message-tail-right-human"
                          }`}
                        />
                        <div className="text-sm">{formatMessage(message.answer)}</div>
                        <span
                          className={`text-[10px] ${
                            message.sender === "ai" ? "text-black/60" : "text-white/80"
                          } mt-1 block`}
                        >
                          {format(parseISO(message.created_at), "h:mm a")} - {message.sender === "ai" ? "AI" : "Human"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {currentMessages.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        )}
        <div className="h-4" ref={dummyRef} />
      </ScrollArea>

      {/* Media preview dialog */}
      {renderMediaPreviewDialog()}

      <MessageInput
        customerNumber={conversation.customer_number || conversation.recipient_id}
        phoneNumber={phoneNumber}
        onMessageSent={refreshMessages}
      />
    </div>
  )
}

export default ConversationView

