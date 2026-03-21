// Interface for the Escalation object
export interface EscalationEvent {
  id: number
  name: string
  description: string
  system_name: string
  type_of_es?: "default" | "organization"
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: number
  customer_number: string
  customer_name: string
  updated_at: string
  business_phone_number?: string | null  // The AppService phone number (business number)
}

export interface WidgetVisitor {
  id: number
  widget?: number | null
  visitor_id?: string | null
  visitor_email?: string | null
  visitor_name?: string | null
  visitor_phone?: string | null
  ip_address?: string | null
  created_at?: string
  last_seen?: string
}

export interface NotificationAssignee {
  id: string
  clerk_id?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  profile_image_url?: string | null
}

// Interface for the main NotificationMessage object
export interface NotificationMessage {
  organization_id: any
  id: number
  escalation_event: EscalationEvent
  assignee: string | NotificationAssignee | null
  chatsession: ChatSession | null
  widget_visitor: WidgetVisitor | null
  message: string
  channel: string
  status: string
  resolved: boolean
  comment: string | null
  escalated_events: string | null
  resolved_at: string | null
  duration: string | null
  updated_at: string
  created_at: string
}

export interface UserNotificationSettings {
  userId: string
  organizationId: string
  lastReadAt: Date
  preferences?: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export type TeamMember = {
  id: string
  name: string
  email: string
  clerk_id?: string
  initials: string
  imageUrl: string
}

export type ClerkMember = {
  id: string
  publicUserData: {
    firstName?: string | null
    lastName?: string | null
    imageUrl?: string | null
    identifier?: string | null
    userId?: string | null
  }
  role: string
}


export interface NotificationContextType {
  notifications: NotificationMessage[]
  historicalNotifications: NotificationMessage[]
  assignedNotifications: NotificationMessage[]
  isConnected: boolean
  unreadCount: number
  markAllAsRead: () => void
  isLoading: boolean
  error: string | null
  fetchHistoricalNotifications: (force?: boolean) => Promise<void>
  fetchAssignedNotifications: (force?: boolean) => Promise<void>
  updateNotification: (notification: NotificationMessage) => void
}
