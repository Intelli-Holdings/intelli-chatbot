export interface Notification {
  id: string;
  event_type: string;
  message: string;
  timestamp: string;
  customerNumber?: string;
  customerName?: string;
  channel: 'whatsapp' | 'website';
  status: 'pending' | 'assigned' | 'resolved';
  assignee?: string;
  resolved: boolean;
  resolvedBy?: string;
  read: boolean;  // Added this
  escalation?: {
    name: string;
    description: string;
  };
}

// Types
export interface Customer {
  id: number;
  customer_number?: string;
  customer_name?: string;
  visitor_id?: string;
  visitor_email?: string;
  visitor_name?: string;
  visitor_phone?: string;
}

export interface Escalation {
  id: number;
  name: string;
  description: string;
  system_name: string;
}

export interface NotificationMessage {
  type: string;
  escalation: {
    id: number;
    name: string;
    description: string;
    system_name: string;
  };
  status: 'pending' | 'assigned' | 'resolved';
  channel: string;
  message: string;
  id: string;
  resolved: boolean;
  comment: string;
  assignee: string;
  customer: {
    id: number;
    customer_number?: string;
    customer_name?: string;
    visitor_id?: string;
    visitor_email?: string;
    visitor_name?: string;
    visitor_phone?: string;
  };
  created_at: string;
}

