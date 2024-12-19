export interface Notification {
    id: string;
    event_type: string;
    message: string;
    timestamp: string;
    customerNumber?: string;
    customerName?: string;
    read: boolean;
  }
  
  