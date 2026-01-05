/**
 * Notifications/Escalations Service - Handles all notification-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface EscalationEvent {
  id: number;
  name: string;
  description: string;
  system_name: string;
  created_at: string;
  updated_at: string;
}

export interface Assignee {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ChatSessionInfo {
  id: number;
  customer_number: string;
  customer_name?: string;
  customer_email?: string;
}

export interface WidgetVisitorInfo {
  id: number;
  visitor_name?: string;
  visitor_email?: string;
}

export interface Notification {
  id: number;
  message: string | null;
  channel: 'whatsapp' | 'instagram' | 'messenger' | 'website';
  status: 'pending' | 'assigned' | 'resolved' | 'closed';
  escalation_event: EscalationEvent | null;
  assignee: Assignee | null;
  chatsession: ChatSessionInfo | null;
  widget_visitor: WidgetVisitorInfo | null;
  resolved: boolean;
  comment: string | null;
  escalated_events: any;
  resolved_at: string | null;
  duration: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export const NotificationService = {
  assign: async (userEmail: string, notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/assign/notification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: userEmail, notification_id: notificationId }),
    });
    return response.json();
  },

  resolve: async (notificationId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/resolve/notification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId }),
    });
    return response.json();
  },

  delete: async (notificationId: string) => {
    // Perform a soft delete by updating the status to "deleted"
    const response = await fetch(`${API_BASE_URL}/notifications/update/notification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId, status: 'deleted' }),
    });
    return response.json();
  },

  getAssignedNotifications: async (userEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/assigned/to/${userEmail}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

/**
 * Fetch notifications/escalations for an organization
 */
export async function getNotificationsByOrganization(
  organizationId: string,
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }
): Promise<NotificationsListResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }

    const url = `/api/notifications/org/${organizationId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

/**
 * Get recent escalations for dashboard display
 */
export async function getRecentEscalations(
  organizationId: string,
  limit: number = 3
): Promise<Array<{
  id: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  status: string;
  channel: string;
  customerName?: string;
  customerNumber?: string;
  createdAt: string;
}>> {
  try {
    const response = await getNotificationsByOrganization(organizationId, {
      page: 1,
      pageSize: limit,
    });

    // Transform notifications into dashboard escalation format
    return response.results.slice(0, limit).map((notification) => {
      // Determine priority based on status and age
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (notification.status === 'pending') {
        priority = 'high';
      } else if (notification.status === 'assigned') {
        priority = 'medium';
      }

      // Calculate relative timestamp
      const createdAt = new Date(notification.created_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

      let timestamp: string;
      if (diffMinutes < 60) {
        timestamp = `${diffMinutes} mins ago`;
      } else if (diffMinutes < 1440) {
        timestamp = `${Math.floor(diffMinutes / 60)} hours ago`;
      } else {
        timestamp = `${Math.floor(diffMinutes / 1440)} days ago`;
      }

      // Get message from notification or escalation event
      const message =
        notification.message ||
        notification.escalation_event?.description ||
        `${notification.channel} escalation`;

      return {
        id: notification.id.toString(),
        priority,
        message,
        timestamp,
        status: notification.status,
        channel: notification.channel,
        customerName: notification.chatsession?.customer_name || notification.widget_visitor?.visitor_name,
        customerNumber: notification.chatsession?.customer_number,
        createdAt: notification.created_at,
      };
    });
  } catch (error) {
    console.error('Error fetching recent escalations:', error);
    return [];
  }
}