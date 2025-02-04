import { NotificationMessage } from '@/types/notifications';

export const testNotifications: NotificationMessage[] = [
  {
    id: '1',
    type: 'customer_inquiry',
    escalation: {
      id: 1,
      name: 'General Inquiry',
      description: 'Customer has a general question',
      system_name: 'inquiry_system'
    },
    status: 'pending',
    channel: 'whatsapp',
    message: 'Customer asking about product availability',
    resolved: false,
    comment: '',
    assignee: '',
    customer: {
      id: 1,
      customer_name: 'John Doe',
      customer_number: '+1234567890'
    },
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'support_ticket',
    escalation: {
      id: 2,
      name: 'Technical Support',
      description: 'Technical issue reported',
      system_name: 'support_system'
    },
    status: 'pending',
    channel: 'website',
    message: 'Unable to access account dashboard',
    resolved: false,
    comment: '',
    assignee: '',
    customer: {
      id: 2,
      customer_name: 'Jane Smith',
      customer_number: '+1987654321'
    },
    created_at: new Date().toISOString()
  }
];

export const Notifications = [
  {
    id: "1",
    event_type: "Customer Request",
    message: "I need help with my order #12345",
    timestamp: "2025-01-28T10:30:00Z",
    customerNumber: "221774130289",
    customerName: "John Doe",
    read: false,
    channel: "whatsapp",
    status: "pending",
    escalation: {
      name: "Order Issue",
      description: "Customer is experiencing problems with their recent order"
    },
    resolvedBy: "",
    assignee: '',
  },
  {
    id: "2",
    event_type: "Customer Inquiry",
    message: "What are your business hours?",
    timestamp: "2025-01-28T11:15:00Z",
    customerNumber: "221774130290",
    customerName: "Jane Smith",
    read: false,
    channel: "website",
    status: "assigned",
    resolvedBy: "",
    assignee: "Alice Johnson"
  },
  {
    id: "3",
    event_type: "Customer Complaint",
    message: "My product arrived damaged",
    timestamp: "2025-01-28T09:45:00Z",
    customerNumber: "221774130291",
    customerName: "Bob Brown",
    read: true,
    channel: "whatsapp",
    status: "resolved",
    resolvedBy: "Charlie Davis",
    assignee: '',
  }
];

export const dummyUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Charlie Davis", email: "charlie@example.com" },
  { id: "4", name: "Diana Wilson", email: "diana@example.com" }
];
