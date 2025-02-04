const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export const NotificationService = {
  assign: async ( userId: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/assign/notification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  resolve: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/resolve/notification/`, {
      method: 'POST',
    });
    return response.json();
  },

  delete: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/delete/`, {
      method: 'DELETE',
    });
    return response.json();
  },
};