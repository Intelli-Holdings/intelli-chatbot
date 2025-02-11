const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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