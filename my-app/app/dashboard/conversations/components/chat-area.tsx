"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import MessageInput from "./messageInput"
import { formatMessage } from "@/utils/formatMessage"
import type { Conversation } from "./types"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import ConversationHeader from "./conversationsHeader"
import { ScrollToBottomButton } from "@/app/dashboard/conversations/components/scroll-to-bottom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FolderDown, File, Image, Music, Video, FileText, ChevronDown, ChevronUp, Send } from "lucide-react"
import { exportToPDF, exportToCSV, exportContactsToPDF, exportContactsToCSV } from "@/utils/exportUtils"
import "./message-bubble.css"
import ResolveReminder from "@/components/resolve-reminder"
import { WebSocketHandler } from "@/components/websocket-handler"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Extended interface to include polling configuration
interface ConversationViewProps {
  conversation: Conversation | null
  conversations: Conversation[]
  phoneNumber: string
  fetchMessages?: (conversationId: string) => Promise<Conversation["messages"]>
}

// Helper types for media previews
interface MediaPreviewState {
  isOpen: boolean
  url: string
  type: string
  filename?: string
}

export default function ChatArea({ conversation, conversations, phoneNumber, fetchMessages }: ConversationViewProps) {
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
  const [isReminderExpanded, setIsReminderExpanded] = useState(true)
  const [isAiSupport, setIsAiSupport] = useState<boolean>()
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()

  // Set initial messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setCurrentMessages(conversation.messages)
      setLastMessageId(
        conversation.messages.length > 0 ? Math.max(...conversation.messages.map((msg) => msg.id)) : null,
      )
    }
  }, [conversation])

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
        setCurrentMessages((prev) => [...prev, newMessage])
        setLastMessageId(newMessage.id)
        setShouldAutoScroll(true)
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
      window.removeEventListener("websocketConnectionChange", handleConnectionChange as EventListener)
    }
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages, shouldAutoScroll])

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100
      setShouldAutoScroll(isScrolledToBottom)
    }
  }

  // Function to fetch and merge new messages from the server
  const refreshMessages = useCallback(async () => {
    if (!conversation || !fetchMessages) return

    try {
      const newMessages = await fetchMessages(conversation.id.toString())

      if (newMessages && newMessages.length > 0) {
        const highestNewId = Math.max(...newMessages.map((msg) => msg.id))

        if (lastMessageId === null || highestNewId > lastMessageId) {
          const actualNewMessages = newMessages.filter((msg) => lastMessageId === null || msg.id > lastMessageId)

          if (actualNewMessages.length > 0) {
            setCurrentMessages((prev) => [...prev, ...actualNewMessages])
            setLastMessageId(highestNewId)

            if (lastMessageId !== null) {
            }
          }
        }
      }

    } catch (error) {
      console.error("Error fetching new messages:", error)
    }
  }, [conversation, fetchMessages, lastMessageId, ])

  // Optimistic UI update on message send
  const handleMessageSent = useCallback(
    (newMessageContent: string) => {
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
      setCurrentMessages((prev) => [...prev, optimisticMessage])
      setLastMessageId(optimisticMessage.id)
      setShouldAutoScroll(true)
    },
    [],
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

  // Get icon based on file type
  const getFileIcon = (mimeType = "") => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-white border-l border-gray-200">
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

      {/* WebSocket connection status indicator - show only when human support is active */}
      {!isAiSupport && (
        <div className="bg-green-50 border-green-200 border-b px-4 py-1 text-sm flex items-center justify-between">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          ></span>
          {isConnected ? "Live connection active" : "Connecting..."}
        </div>
      )}

      <div className="bg-white border-gray-100">
        <div
          className="flex px-2 py-1 items-center justify-end border-b cursor-pointer"
          onClick={() => setIsReminderExpanded(!isReminderExpanded)}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="font-medium" disabled>
                Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExport("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <div className="h-px bg-muted my-1" />
              <DropdownMenuItem className="font-medium" disabled>
                Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts("pdf")}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleExportContacts("csv")}>
                <FolderDown className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs p-2 font-medium text-gray-500">Important Reminder</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isReminderExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${isReminderExpanded ? "max-h-30" : "max-h-0"}`}>
          <div className="px-1 py-1">
            <ResolveReminder />
          </div>
        </div>
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
        <div className="flex flex-col gap-2">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div className="" key={date}>
              {renderDateSeparator(date)}
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col mb-4">
                  {message.content && (
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
                  )}
                  {message.answer && (
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
                        {message.pending && " (sending...)"}
                      </span>
                    </div>
                  )}
                  {message.media && (
                    <div className="message-bubble message-customer">
                      <div className="message-tail message-tail-left" />
                      <div className="text-sm cursor-pointer" onClick={() => {}}>
                        <div className="max-w-xs rounded-lg overflow-hidden shadow">
                          {message.type === "image" ? (
                            <img
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
                      <span className="text-[10px] text-white/80 mt-1 block">
                        {format(parseISO(message.created_at), "h:mm a")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {currentMessages.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p>No Messages yet</p>
            </div>
          )}
          <div className="h-4" ref={dummyRef} />
          <ScrollToBottomButton targetRef={dummyRef} threshold={150} />
        </div>
      </div>
      <div className="p-2 gap-2">
        <MessageInput
          customerNumber={conversation.customer_number || conversation.recipient_id}
          phoneNumber={phoneNumber}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Hidden audio element for browsers that need it */}
      <audio id="notification-sound" src="/notification-sound.mp3" preload="auto" style={{ display: "none" }} />
    </div>
  )
}

