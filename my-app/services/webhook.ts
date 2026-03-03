import { logger } from "@/lib/logger";
import {
  WebhookDestination,
  WebhookDestinationListItem,
  CreateWebhookDestinationRequest,
  UpdateWebhookDestinationRequest,
  WebhookTestResult,
  InboundWebhook,
  InboundWebhookListItem,
  CreateInboundWebhookRequest,
  UpdateInboundWebhookRequest,
  InboundWebhookLog,
  InboundWebhookLogListItem,
  TestWebhookDestinationRequest,
  TestInboundWebhookRequest,
  TestInboundWebhookResult,
  PaginatedResponse,
} from '@/types/webhook';

// Use Django backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

// Helper to get auth headers (Clerk JWT)
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Try to get auth token from Clerk (client-side)
  if (typeof window !== 'undefined') {
    try {
      // @ts-expect-error - Clerk is loaded globally
      const clerk = window.Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      logger.warn('Failed to get Clerk token', { error: e instanceof Error ? e.message : String(e) });
    }
  }

  return headers;
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || `HTTP error: ${response.status}`);
  }
  return response.json();
}

// Helper to extract results from paginated or array response
function extractResults<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray((data as PaginatedResponse<T>).results)) {
    return (data as PaginatedResponse<T>).results;
  }
  logger.warn('Unexpected API response format', { data });
  return [];
}

export class WebhookService {
  // ==========================================
  // Webhook Destinations (Outbound Webhooks)
  // ==========================================

  /**
   * Get all webhook destinations for an organization
   */
  static async getDestinations(organizationId: string): Promise<WebhookDestinationListItem[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/?organization=${organizationId}`,
      { method: 'GET', headers }
    );
    const data = await handleResponse<WebhookDestinationListItem[] | PaginatedResponse<WebhookDestinationListItem>>(response);
    return extractResults(data);
  }

  /**
   * Get a single webhook destination
   */
  static async getDestination(id: string): Promise<WebhookDestination> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/${id}/`,
      { method: 'GET', headers }
    );
    return handleResponse<WebhookDestination>(response);
  }

  /**
   * Create a webhook destination
   */
  static async createDestination(data: CreateWebhookDestinationRequest): Promise<WebhookDestination> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );
    return handleResponse<WebhookDestination>(response);
  }

  /**
   * Update a webhook destination
   */
  static async updateDestination(id: string, data: UpdateWebhookDestinationRequest): Promise<WebhookDestination> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/${id}/`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      }
    );
    return handleResponse<WebhookDestination>(response);
  }

  /**
   * Delete a webhook destination
   */
  static async deleteDestination(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/${id}/`,
      { method: 'DELETE', headers }
    );
    if (!response.ok) {
      throw new Error('Failed to delete webhook destination');
    }
  }

  /**
   * Test a webhook destination
   */
  static async testDestination(id: string, data?: TestWebhookDestinationRequest): Promise<WebhookTestResult> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/webhook-destinations/${id}/test/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data || {}),
      }
    );
    return handleResponse<WebhookTestResult>(response);
  }

  /**
   * Toggle webhook destination active status
   */
  static async toggleDestination(id: string, isActive: boolean): Promise<WebhookDestination> {
    return this.updateDestination(id, { is_active: isActive });
  }

  // ==========================================
  // Inbound Webhooks
  // ==========================================

  /**
   * Get all inbound webhooks for an organization
   */
  static async getInboundWebhooks(organizationId: string): Promise<InboundWebhookListItem[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/?organization=${organizationId}`,
      { method: 'GET', headers }
    );
    const data = await handleResponse<InboundWebhookListItem[] | PaginatedResponse<InboundWebhookListItem>>(response);
    return extractResults(data);
  }

  /**
   * Get a single inbound webhook
   */
  static async getInboundWebhook(id: string): Promise<InboundWebhook> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${id}/`,
      { method: 'GET', headers }
    );
    return handleResponse<InboundWebhook>(response);
  }

  /**
   * Create an inbound webhook
   */
  static async createInboundWebhook(data: CreateInboundWebhookRequest): Promise<InboundWebhook> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );
    return handleResponse<InboundWebhook>(response);
  }

  /**
   * Update an inbound webhook
   */
  static async updateInboundWebhook(id: string, data: UpdateInboundWebhookRequest): Promise<InboundWebhook> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${id}/`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      }
    );
    return handleResponse<InboundWebhook>(response);
  }

  /**
   * Delete an inbound webhook
   */
  static async deleteInboundWebhook(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${id}/`,
      { method: 'DELETE', headers }
    );
    if (!response.ok) {
      throw new Error('Failed to delete inbound webhook');
    }
  }

  /**
   * Test an inbound webhook
   */
  static async testInboundWebhook(id: string, data: TestInboundWebhookRequest): Promise<TestInboundWebhookResult> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${id}/test/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }
    );
    return handleResponse<TestInboundWebhookResult>(response);
  }

  /**
   * Get inbound webhook logs
   */
  static async getInboundWebhookLogs(
    webhookId: string,
    params?: { status?: string; limit?: number; offset?: number }
  ): Promise<InboundWebhookLogListItem[]> {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${webhookId}/logs/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, { method: 'GET', headers });
    const data = await handleResponse<InboundWebhookLogListItem[] | PaginatedResponse<InboundWebhookLogListItem>>(response);
    return extractResults(data);
  }

  /**
   * Get a single inbound webhook log (full detail with payload)
   */
  static async getInboundWebhookLog(webhookId: string, logId: string): Promise<InboundWebhookLog> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${webhookId}/logs/?log_id=${logId}`,
      { method: 'GET', headers }
    );
    return handleResponse<InboundWebhookLog>(response);
  }

  /**
   * Regenerate API key for inbound webhook
   */
  static async regenerateApiKey(id: string): Promise<InboundWebhook> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chatbot_automation/inbound-webhooks/${id}/regenerate-api-key/`,
      { method: 'POST', headers }
    );
    return handleResponse<InboundWebhook>(response);
  }

  /**
   * Toggle inbound webhook active status
   */
  static async toggleInboundWebhook(id: string, isActive: boolean): Promise<InboundWebhook> {
    return this.updateInboundWebhook(id, { is_active: isActive });
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Copy webhook URL to clipboard
   */
  static copyWebhookUrl(url: string): Promise<void> {
    return navigator.clipboard.writeText(url);
  }

  /**
   * Format webhook URL for display (truncate if too long)
   */
  static formatWebhookUrl(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate a sample payload for testing
   */
  static generateSamplePayload(contactMatchField: string): Record<string, unknown> {
    const base: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      source: 'test',
    };

    // Add contact field based on match field
    if (contactMatchField === 'phone_number') {
      base.phone_number = '+1234567890';
    } else if (contactMatchField === 'email') {
      base.email = 'test@example.com';
    } else if (contactMatchField === 'customer.phone') {
      base.customer = { phone: '+1234567890', name: 'Test Customer' };
    } else if (contactMatchField === 'contact.phone') {
      base.contact = { phone: '+1234567890', name: 'Test Contact' };
    } else {
      // Generic field
      base[contactMatchField] = 'test_value';
    }

    return base;
  }

  /**
   * Validate webhook URL
   */
  static isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export default WebhookService;
