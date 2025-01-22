export interface Organization {
    id: string
    name: string
    memberCount?: number
    createdAt: Date
    role?: string
  }
  
  export interface InviteModalProps {
    isOpen: boolean
    onClose: () => void
    organizationId: string
  }
  
  