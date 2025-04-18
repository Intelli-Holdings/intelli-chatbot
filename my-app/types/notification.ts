
// Interface for the Escalation object
export interface Escalation {
  id: number
  name: string
  description: string
  system_name: string
  created_at: string
  updated_at: string
}

// Interface for the Customer object
export interface Customer {
  id: number
  customer_number: string
  customer_name: string
  updated_at: string
}

// Interface for the main NotificationMessage object
export interface NotificationMessage {
  id: string
  type: string
  escalation: Escalation
  status: string
  channel: string
  message: string
  resolved: boolean
  comment: string | null
  assignee: string
  customer: Customer
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
  isConnected: boolean
  unreadCount: number
  markAllAsRead: () => void
  isLoading: boolean
  error: string | null
}
