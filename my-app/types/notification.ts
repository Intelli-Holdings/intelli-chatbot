export interface Notification {
    id: string;
    event_type: string;
    message: string;
    timestamp: string;
    customerNumber?: string;
    customerName?: string;
    read: boolean;
  }

  export type Customer = {
    id: number;
    customer_number?: string;
    customer_name?: string;
    visitor_id?: string;
    visitor_email?: string;
    visitor_name?: string;
    visitor_phone?: string;
  };
  
  export type Escalation = {
    id: number;
    name: string;
    description: string;
    system_name: string;
  };
  
  export type NotificationMessage = {
    type: string;
    escalation: Escalation;
    status: "pending" | "assigned" | "resolved";
    channel: string;
    message: string;
    id: string;
    resolved: boolean;
    comment: string;
    assignee: string;
    customer: Customer;
    created_at: string;
  };
  
  export type TeamMember = {
    id: string;
    name: string;
    initials: string;
    imageUrl: string;
  };
  
  export type ClerkMember = {
    id: string;
    publicUserData: {
      firstName?: string | null;
      lastName?: string | null;
      imageUrl?: string | null;
      identifier?: string | null;
    };
    role: string;
  };
  