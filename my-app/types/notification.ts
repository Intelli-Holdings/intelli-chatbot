// Interface for the Escalation object
export interface EscalationEvent {
  id: number
  name: string
  description: string
  system_name: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: number
  customer_number: string
  customer_name: string
  updated_at: string
}

// Interface for the main NotificationMessage object
export interface NotificationMessage {
  id: number
  escalation_event: EscalationEvent
  assignee: string | null
  chatsession: ChatSession
  widget_visitor: any
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
  fetchHistoricalNotifications: () => Promise<void>
  fetchAssignedNotifications: () => Promise<void>
}
