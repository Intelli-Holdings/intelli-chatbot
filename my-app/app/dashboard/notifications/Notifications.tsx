"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  MessageCircle,
  Calendar,
  AlertCircle,
  Globe,
  Mail,
  Facebook,
  MessageSquare,
  CheckCircle,
  UserPlus,
  RefreshCcw,
  FileImage,
  Music,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  LayoutList,
  Phone,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { NotificationMessage, TeamMember } from "@/types/notification"
import { useOrganization } from "@clerk/nextjs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNotificationContext } from "@/hooks/use-notification-context"
import Image from "next/image"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useUser } from "@clerk/nextjs"
import EscalationEvents from "@/components/EscalationEvents"

interface NotificationsProps {
  members?: TeamMember[]
}

const Notifications: React.FC<NotificationsProps> = ({ members = [] }) => {
  const router = useRouter()
  const activeOrganizationId = useActiveOrganizationId()
  const { user } = useUser()
  const [showAssigneeSelect, setShowAssigneeSelect] = useState<string | null>(null)
  const [organizationUsers, setOrganizationUsers] = useState<
    Array<{ id: string; name: string; email: string; image: string }>
  >([])
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'live' | 'assigned'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedNotifications, setPaginatedNotifications] = useState<NotificationMessage[]>([])
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grouped' | 'kanban'>('list')
  const [collapsedCustomers, setCollapsedCustomers] = useState<Record<string, boolean>>({})
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set())
  const { organization } = useOrganization()
  const {
    notifications,
    historicalNotifications,
    assignedNotifications,
    isLoading: notificationsLoading,
    error,
    markAllAsRead,
    fetchHistoricalNotifications,
    fetchAssignedNotifications
  } = useNotificationContext()

  const PAGE_SIZE = 10

  // Fetch paginated notifications
  const fetchPaginatedNotifications = async (page: number) => {
    if (!activeOrganizationId && notificationFilter === 'all') return
    if (!user?.primaryEmailAddress?.emailAddress && notificationFilter === 'assigned') return

    setIsPaginationLoading(true)
    try {
      let url = ''
      if (notificationFilter === 'assigned') {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/assigned/to/${user?.primaryEmailAddress?.emailAddress}/?page=${page}&page_size=${PAGE_SIZE}`
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/org/${activeOrganizationId}/?page=${page}&page_size=${PAGE_SIZE}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      setPaginatedNotifications(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / PAGE_SIZE))
      setCurrentPage(page)
    } catch (err) {
      toast.error('Failed to load notifications')
      console.error('Pagination error:', err)
    } finally {
      setIsPaginationLoading(false)
    }
  }

  // Load paginated notifications when filter changes or on mount
  useEffect(() => {
    if (notificationFilter !== 'live') {
      fetchPaginatedNotifications(1)
    }
  }, [notificationFilter, activeOrganizationId, user])

  // Get the appropriate notifications based on the filter
  const filteredNotifications = useMemo(() => {
    switch (notificationFilter) {
      case 'live':
        return notifications.filter(n => !historicalNotifications.some(hn => hn.id === n.id))
      case 'assigned':
      case 'all':
        return paginatedNotifications
      default:
        return paginatedNotifications
    }
  }, [notificationFilter, notifications, historicalNotifications, paginatedNotifications])

  // Group notifications by customer
  const groupedByCustomer = useMemo(() => {
    const groups: Record<string, NotificationMessage[]> = {}
    filteredNotifications.forEach(notification => {
      const customerNumber = notification.chatsession?.customer_number || 'Unknown'
      if (!groups[customerNumber]) {
        groups[customerNumber] = []
      }
      groups[customerNumber].push(notification)
    })
    return groups
  }, [filteredNotifications])

  // Group notifications by status for Kanban view
  const groupedByStatus = useMemo(() => {
    const pending = filteredNotifications.filter(n => n.status !== 'resolved' && !n.resolved)
    const resolved = filteredNotifications.filter(n => n.status === 'resolved' || n.resolved)
    return { pending, resolved }
  }, [filteredNotifications])

  const toggleCustomerCollapse = (customerNumber: string) => {
    setCollapsedCustomers(prev => ({
      ...prev,
      [customerNumber]: !prev[customerNumber]
    }))
  }

  // Selection handlers
  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const selectAllNotifications = () => {
    const unresolved = filteredNotifications.filter(n => n.status !== 'resolved' && !n.resolved)
    setSelectedNotifications(new Set(unresolved.map(n => n.id)))
  }

  const clearSelection = () => {
    setSelectedNotifications(new Set())
  }

  const bulkResolveNotifications = async () => {
    if (selectedNotifications.size === 0) return

    const selectedIds = Array.from(selectedNotifications)
    setIsLoading(prev => ({ ...prev, 'bulk-resolve': true }))

    try {
      // Resolve all selected notifications
      await Promise.all(
        selectedIds.map(id =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/resolve/${id}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      )

      toast.success(`${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''} resolved`)
      clearSelection()

      // Refresh notifications
      if (notificationFilter === 'assigned') {
        await fetchAssignedNotifications()
      } else if (notificationFilter === 'all') {
        await fetchHistoricalNotifications()
      }
      await fetchPaginatedNotifications(currentPage)
    } catch (error) {
      console.error('Failed to resolve notifications:', error)
      toast.error('Failed to resolve notifications')
    } finally {
      setIsLoading(prev => ({ ...prev, 'bulk-resolve': false }))
    }
  }

  useEffect(() => {
    const fetchOrganizationMembers = async () => {
      if (organization) {
        try {
          const memberList = await organization.getMemberships()
          const formattedMembers = memberList.data.map((member) => ({
            id: member.publicUserData?.userId || "",
            image: member.publicUserData?.imageUrl || "",
            name: `${member.publicUserData?.firstName || ""} ${member.publicUserData?.lastName || ""}`.trim(),
            email: member.publicUserData?.identifier || "",
          }))
          setOrganizationUsers(formattedMembers)
        } catch (error) {
          toast("Failed to fetch team members", {
            description: "Could not load team members",
            action: {
              label: "Retry",
              onClick: () => fetchOrganizationMembers(),
            },
          })
        }
      }
    }
    fetchOrganizationMembers()
  }, [organization])

  const getAssignee = (notification: NotificationMessage) => {
    if (notification.assignee) {
      // First try to find in organization users
      const user = organizationUsers.find((u) => u.id === notification.assignee)
      if (user) {
        return {
          name: user.name,
          email: user.email,
          image: user.image
        }
      }
      // Then try to find in members prop
      const member = members.find((m) => m.id === notification.assignee)
      if (member) {
        return {
          name: member.name,
          email: member.email || '',
          image: (member as any).image || ""
        }
      }
    }
    return { name: "Unassigned", email: "", image: "" }
  }

  const handleAssigneeChange = async (notificationId: string, assigneeId: string) => {
    setIsLoading((prev) => ({ ...prev, [notificationId]: true }))

    try {
      const selectedUser = organizationUsers.find((user) => user.id === assigneeId)
      if (!selectedUser) {
        throw new Error("Selected user not found")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/assign/notification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: selectedUser.email,
          notification_id: notificationId,
        }),
      })
      if (!response.ok) {
        throw new Error(`Failed to assign: ${response.statusText}`)
      }
      toast("Success", {
        description: `Assigned to ${selectedUser.name}`,
      })

    } catch (error) {
      toast("Assignment Failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
        
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [notificationId]: false }))
      setShowAssigneeSelect(null)
    }
  }

  const handleResolveNotification = async (notificationId: string) => {
    setIsLoading((prev) => ({ ...prev, [`resolve-${notificationId}`]: true }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/resolve/notification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_id: notificationId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to resolve: ${response.statusText}`)
      }

      toast("Success", {
        description: "Notification resolved successfully",
      })

    } catch (error) {
      // Failed to resolve notification
    } finally {
      setIsLoading((prev) => ({ ...prev, [`resolve-${notificationId}`]: false }))
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase() || "") {
      case "whatsapp":
        return "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      case "facebook":
        return <Facebook className="h-full w-full" />
      case "messenger":
        return <MessageSquare className="h-full w-full" />
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      case "email":
        return <Mail className="h-full w-full" />
      case "website":
        return <Globe className="h-full w-full" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const handleNavigateToConversation = (notification: NotificationMessage) => {
    // Default path for unknown channels
    let basePath = '/dashboard/conversations';

    // Normalize channel name to lowercase for comparison
    const normalizedChannel = (notification.channel || '').toLowerCase();

    switch (normalizedChannel) {
      case 'whatsapp':
        basePath = '/dashboard/conversations/whatsapp';
        break;
      case 'website':
        basePath = '/dashboard/conversations/website';
        break;
      case 'facebook':
      case 'messenger':
        basePath = '/dashboard/conversations/facebook';
        break;
      case 'instagram':
        basePath = '/dashboard/conversations/instagram';
        break;
      case 'email':
        basePath = '/dashboard/conversations/email';
        break;
      default:
        // If no specific channel is matched, use default path
        break;
    }

    // Add customer number as query parameter to open specific conversation
    const customerNumber = notification.chatsession?.customer_number || '';
    if (customerNumber) {
      router.push(`${basePath}?customer=${encodeURIComponent(customerNumber)}`);
    } else {
      router.push(basePath);
    }
  }

  // Extract media information from message
  const extractMediaFromMessage = (message: string) => {
    if (!message) return { type: null, url: '', text: '' }

    // Check for "The customer shared an [type]. Download URL: [url]" format
    const sharedMediaMatch = message.match(/customer shared (?:an?|the)\s+(image|audio|video|document|file).*?Download URL:\s*(https?:\/\/[^\s]+)/i)

    if (sharedMediaMatch) {
      const mediaType = sharedMediaMatch[1].toLowerCase()
      const url = sharedMediaMatch[2]

      // Extract any additional text before the "Download URL" part
      const textBeforeUrl = message.split(/Download URL:/i)[0].trim()

      return {
        type: mediaType as 'image' | 'audio' | 'video' | 'document',
        url: url,
        text: '' // Don't show the generic "customer shared" text
      }
    }

    // Try old format with [IMAGE], [AUDIO], etc. placeholders
    const imageMatch = message.match(/\[IMAGE\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
    const audioMatch = message.match(/\[AUDIO\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
    const videoMatch = message.match(/\[VIDEO\]\s*(\d+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)
    const documentMatch = message.match(/\[DOCUMENT\]\s*([^\s\]]+)?(?:\s*-\s*)?(https?:\/\/[^\s\]]+)?/i)

    if (imageMatch) {
      return {
        type: 'image' as const,
        url: imageMatch[2] || '',
        text: message.replace(/\[IMAGE\][^\n]*/gi, '').trim()
      }
    }
    if (audioMatch) {
      return {
        type: 'audio' as const,
        url: audioMatch[2] || '',
        text: message.replace(/\[AUDIO\][^\n]*/gi, '').trim()
      }
    }
    if (videoMatch) {
      return {
        type: 'video' as const,
        url: videoMatch[2] || '',
        text: message.replace(/\[VIDEO\][^\n]*/gi, '').trim()
      }
    }
    if (documentMatch) {
      return {
        type: 'document' as const,
        url: documentMatch[2] || '',
        fileName: documentMatch[1] || 'Document',
        text: message.replace(/\[DOCUMENT\][^\n]*/gi, '').trim()
      }
    }

    // Check for direct media URLs in the message
    const urlMatch = message.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp))/i)
    if (urlMatch) {
      return {
        type: 'image' as const,
        url: urlMatch[0],
        text: message.replace(urlMatch[0], '').trim()
      }
    }

    return {
      type: null,
      url: '',
      text: message
    }
  }

  // Get icon for media type
  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4 text-blue-500" />
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />
      case 'audio':
        return <Music className="h-4 w-4 text-[#007fff]" />
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  // Render a single notification card
  const renderNotificationCard = (notification: NotificationMessage) => {
    const assigneeInfo = getAssignee(notification)
    const mediaInfo = extractMediaFromMessage(notification.message)
    const hasMedia = mediaInfo.type && mediaInfo.url
    const isResolved = notification.status === 'resolved' || notification.resolved
    const isSelected = selectedNotifications.has(notification.id)

    return (
      <div
        key={notification.id}
        className={`bg-white hover:bg-[#f5f6f6] transition-colors duration-150 px-4 py-3 ${isSelected ? 'ring-2 ring-[#007fff] ring-inset' : ''}`}
      >
        {/* Header: Customer info, channel, and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!isResolved && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleNotificationSelection(notification.id)}
                className="mt-1"
              />
            )}
            <Avatar className="h-9 w-9 shrink-0">
              {(() => {
                const channelIcon = getChannelIcon(notification.channel)
                return typeof channelIcon === "string" ? (
                  <AvatarImage src={channelIcon || "/placeholder.svg"} alt={notification.channel} />
                ) : (
                  channelIcon || (
                    <AvatarFallback className="bg-[#007fff] text-white text-xs">
                      {(notification.channel?.[0] || "N").toUpperCase()}
                    </AvatarFallback>
                  )
                )
              })()}
              <AvatarFallback className="bg-[#007fff] text-white text-xs">
                {(notification.channel?.[0] || "N").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3
                  className="text-[14px] font-semibold text-[#111b21] hover:text-[#007fff] cursor-pointer truncate"
                  onClick={() => handleNavigateToConversation(notification)}
                >
                  {notification.chatsession?.customer_name || "Unknown Customer"}
                </h3>
                <span className="text-[11px] text-[#667781] shrink-0">
                  {formatDate(notification.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#667781]">
                  {notification.chatsession?.customer_number || ""}
                </span>
                <span className="text-[11px] text-[#667781]">•</span>
                <span className="text-[11px] text-[#667781] capitalize">
                  {notification.channel || "System"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <Badge
              variant={notification.status === "pending" ? "destructive" : "default"}
              className="text-[10px] h-5 px-2 bg-[#fff4e6] text-[#e65100] border-[#ffe0b2] hover:bg-[#ffeccc]"
            >
              {notification.status || "pending"}
            </Badge>
            {notification.status !== "resolved" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] text-[#007fff] hover:bg-[#f0f2f5]"
                onClick={() => handleResolveNotification(notification.id.toString())}
                disabled={isLoading[`resolve-${notification.id}`]}
              >
                {isLoading[`resolve-${notification.id}`] ? (
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Message content */}
        <div
          className="bg-[#f0f2f5] rounded-lg px-3 py-2 mb-2 cursor-pointer hover:bg-[#e9edef] transition-colors"
          onClick={() => handleNavigateToConversation(notification)}
        >
          <div className="flex gap-2">
            {/* Media preview */}
            {hasMedia && (
              <div className="shrink-0">
                {mediaInfo.type === 'image' && mediaInfo.url ? (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white border border-[#e9edef]">
                    <Image
                      src={mediaInfo.url}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 rounded-md bg-white border border-[#e9edef]">
                    {getMediaIcon(mediaInfo.type || '')}
                  </div>
                )}
              </div>
            )}

            {/* Text content */}
            <div className="flex-1 min-w-0">
              {mediaInfo.text ? (
                <p className="text-[13px] text-[#111b21] leading-relaxed line-clamp-2">
                  {mediaInfo.text}
                </p>
              ) : hasMedia ? (
                <div>
                  <p className="text-[13px] text-[#667781] italic">
                    {mediaInfo.type === 'image' && '📷 Image'}
                    {mediaInfo.type === 'video' && '🎥 Video'}
                    {mediaInfo.type === 'audio' && '🎵 Audio'}
                    {mediaInfo.type === 'document' && `📄 ${mediaInfo.fileName || 'Document'}`}
                  </p>
                  {!mediaInfo.url && (
                    <p className="text-[10px] text-[#667781] mt-1">Click to view in conversation</p>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-[#111b21] leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Assignment and metadata */}
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            {showAssigneeSelect === notification.id.toString() ? (
              <Select
                value={notification.assignee || ""}
                onValueChange={(value) => handleAssigneeChange(notification.id.toString(), value)}
                disabled={isLoading[notification.id.toString()]}
              >
                <SelectTrigger className="w-[160px] h-7 text-[11px] border-[#e9edef]">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {organizationUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-[11px]">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-1.5">
                {assigneeInfo.name !== "Unassigned" ? (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={assigneeInfo.image || ""} />
                      <AvatarFallback className="bg-[#6b7c85] text-white text-[9px]">
                        {assigneeInfo.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[#667781]">{assigneeInfo.name}</span>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-[#007fff] hover:bg-[#f0f2f5]"
                    onClick={() => setShowAssigneeSelect(notification.id.toString())}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            )}
          </div>
          {notification.escalation_event && (
            <div className="flex items-center gap-1 text-[#667781]">
              <AlertCircle className="h-3 w-3" />
              <span className="text-[11px]">{notification.escalation_event.name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="notifications" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-9 rounded-full border border-[#e9edef] bg-[#f0f2f5] text-[#667781]">
          <TabsTrigger
            value="notifications"
            className="text-xs px-4 data-[state=active]:bg-white data-[state=active]:text-[#111b21]"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="escalations"
            className="text-xs px-4 data-[state=active]:bg-white data-[state=active]:text-[#111b21]"
          >
            Escalation Events
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="notifications" className="mt-0">
        <Card className="w-full mx-auto border-[#e9edef] shadow-sm">
      <CardHeader className="border-b border-[#e9edef] pb-3 pt-3 bg-[#f0f2f5]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-[17px] font-semibold text-[#111b21]">
            <Bell className="h-5 w-5 text-[#007fff]" />
            <span>Notifications</span>
            {selectedNotifications.size > 0 && (
              <Badge className="bg-[#007fff] text-white hover:bg-[#0067d6] ml-2">
                {selectedNotifications.size} selected
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={notificationFilter}
              onValueChange={(value: 'all' | 'live' | 'assigned') => {
                setNotificationFilter(value)
                clearSelection() // Clear selection when changing filters
                if (value === 'assigned') {
                  fetchAssignedNotifications()
                } else if (value === 'all') {
                  fetchHistoricalNotifications()
                }
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs border-[#e9edef] bg-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#e9edef] rounded-md bg-white">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 px-3 rounded-r-none ${viewMode === 'list' ? '!bg-[#007fff] hover:!bg-[#0067d6] !text-white' : 'hover:bg-[#f0f2f5] text-[#667781]'}`}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grouped')}
                className={`h-8 px-3 rounded-none border-l border-r border-[#e9edef] ${viewMode === 'grouped' ? '!bg-[#007fff] hover:!bg-[#0067d6] !text-white' : 'hover:bg-[#f0f2f5] text-[#667781]'}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={`h-8 px-3 rounded-l-none ${viewMode === 'kanban' ? '!bg-[#007fff] hover:!bg-[#0067d6] !text-white' : 'hover:bg-[#f0f2f5] text-[#667781]'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Bulk Selection Controls */}
            {selectedNotifications.size > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="h-8 px-3 text-xs border-[#e9edef] hover:bg-[#f0f2f5]"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={bulkResolveNotifications}
                  disabled={isLoading['bulk-resolve']}
                  className="h-8 px-3 text-xs !bg-[#007fff] hover:!bg-[#0067d6] !text-white"
                >
                  {isLoading['bulk-resolve'] ? (
                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  <span>Resolve Selected</span>
                </Button>
              </>
            ) : (
              <>
                {filteredNotifications.filter(n => n.status !== 'resolved' && !n.resolved).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllNotifications}
                    className="h-8 px-3 text-xs border-[#e9edef] hover:bg-[#f0f2f5]"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    <span>Select All</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-white">
        {notificationsLoading ? (
          <div className="flex justify-center items-center h-[200px] bg-white">
            <RefreshCcw className="h-6 w-6 text-[#007fff] animate-spin" />
            <span className="ml-2 text-[13px] text-[#667781]">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-[200px] text-center bg-white">
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-[13px] text-[#667781] mb-4">{error}</p>
          </div>
        ) : (
          <>
            {/* List View (Default) */}
            {viewMode === 'list' && (
            <ScrollArea className="h-[calc(100vh-260px)] bg-white">
              {(!filteredNotifications || filteredNotifications.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-[#667781] mb-3 opacity-50" />
                  <p className="text-[14px] text-[#667781]">No notifications to display</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e9edef]">
                  {filteredNotifications.map((notification) => renderNotificationCard(notification))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Grouped by Customer View */}
          {viewMode === 'grouped' && (
            <ScrollArea className="h-[calc(100vh-260px)] bg-white">
              {Object.keys(groupedByCustomer).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-[#667781] mb-3 opacity-50" />
                  <p className="text-[14px] text-[#667781]">No notifications to display</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e9edef]">
                  {Object.entries(groupedByCustomer).map(([customerNumber, notifications]) => {
                    const isCollapsed = collapsedCustomers[customerNumber]
                    const firstNotification = notifications[0]
                    const customerName = firstNotification?.chatsession?.customer_name || 'Unknown Customer'
                    const unreadCount = notifications.filter(n => n.status !== 'resolved').length

                    return (
                      <Collapsible
                        key={customerNumber}
                        open={!isCollapsed}
                        onOpenChange={() => toggleCustomerCollapse(customerNumber)}
                      >
                        <div className="bg-[#f0f2f5] px-4 py-2.5 hover:bg-[#e9edef] transition-colors">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isCollapsed ? (
                                  <ChevronRight className="h-4 w-4 text-[#667781]" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-[#667781]" />
                                )}
                                <Phone className="h-4 w-4 text-[#007fff]" />
                                <div className="flex flex-col items-start">
                                  <span className="text-[14px] font-semibold text-[#111b21]">
                                    {customerName}
                                  </span>
                                  <span className="text-[12px] text-[#667781]">
                                    +{customerNumber}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                  <Badge className="bg-[#007fff] text-white hover:bg-[#0067d6] text-[10px] h-5 px-2">
                                    {unreadCount}
                                  </Badge>
                                )}
                                <span className="text-[11px] text-[#667781]">
                                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                          <div className="divide-y divide-[#e9edef]">
                            {notifications.map((notification) => renderNotificationCard(notification))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="h-[calc(100vh-260px)] bg-[#f0f2f5] overflow-x-auto">
              <div className="flex gap-6 p-6 max-w-7xl mx-auto">
                {/* Pending Column */}
                <div className="flex-1 min-w-[400px]">
                  <div className="bg-white rounded-lg border border-[#e9edef] shadow-sm">
                    <div className="px-4 py-3 border-b border-[#e9edef] bg-[#fff4e6]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-[#111b21]">Pending</h3>
                        <Badge className="bg-[#f57c00] text-white hover:bg-[#ef6c00] text-[10px] h-5 px-2">
                          {groupedByStatus.pending.length}
                        </Badge>
                      </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-340px)]">
                      <div className="divide-y divide-[#e9edef]">
                        {groupedByStatus.pending.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-[#667781]">
                            <CheckCircle className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-[13px]">No pending notifications</p>
                          </div>
                        ) : (
                          groupedByStatus.pending.map((notification) => renderNotificationCard(notification))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Resolved Column */}
                <div className="flex-1 min-w-[400px]">
                  <div className="bg-white rounded-lg border border-[#e9edef] shadow-sm">
                    <div className="px-4 py-3 border-b border-[#e9edef] bg-[#e6f2ff]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-[#111b21]">Resolved</h3>
                        <Badge className="bg-[#007fff] text-white hover:bg-[#0067d6] text-[10px] h-5 px-2">
                          {groupedByStatus.resolved.length}
                        </Badge>
                      </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-340px)]">
                      <div className="divide-y divide-[#e9edef]">
                        {groupedByStatus.resolved.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-[#667781]">
                            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-[13px]">No resolved notifications</p>
                          </div>
                        ) : (
                          groupedByStatus.resolved.map((notification) => renderNotificationCard(notification))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        )}

        {/* Pagination Controls - Hidden for Kanban view */}
        {viewMode !== 'kanban' && notificationFilter !== 'live' && !notificationsLoading && !error && filteredNotifications.length > 0 && (
          <div className="border-t border-[#e9edef] bg-[#f0f2f5] px-4 py-3 flex items-center justify-between">
            <div className="text-[11px] text-[#667781]">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPaginatedNotifications(currentPage - 1)}
                disabled={currentPage === 1 || isPaginationLoading}
                className="h-7 px-2 text-xs border-[#e9edef] hover:bg-white"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchPaginatedNotifications(pageNum)}
                      disabled={isPaginationLoading}
                      className={`h-7 w-7 p-0 text-xs ${
                        currentPage === pageNum
                          ? "bg-[#007fff] hover:bg-[#0067d6] text-white border-[#007fff]"
                          : "border-[#e9edef] hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPaginatedNotifications(currentPage + 1)}
                disabled={currentPage === totalPages || isPaginationLoading}
                className="h-7 px-2 text-xs border-[#e9edef] hover:bg-white"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="escalations" className="mt-0">
        <EscalationEvents className="pt-0" />
      </TabsContent>
    </Tabs>
  )
}

export default Notifications
