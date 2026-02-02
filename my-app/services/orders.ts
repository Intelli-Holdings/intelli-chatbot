/**
 * Orders Service
 * Handles order management for WhatsApp Commerce
 */

import type {
  WhatsAppOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderQueryFilters,
  OrderStatus,
} from '@/types/ecommerce';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

/**
 * API Error response
 */
interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
}

export class OrdersService {
  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  /**
   * Extract error message from API response
   */
  static extractErrorMessage(error: ApiError | Error | unknown): string {
    if (!error) {
      return 'Unknown error occurred';
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object') {
      const apiError = error as ApiError;
      return apiError.error || apiError.message || apiError.detail || 'An API error occurred';
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }

  // ==========================================================================
  // ORDER CRUD
  // ==========================================================================

  /**
   * Get all orders for an organization
   */
  static async getOrders(
    organizationId: string,
    filters?: OrderQueryFilters
  ): Promise<{ orders: WhatsAppOrder[]; total: number }> {
    try {
      const params = new URLSearchParams({
        organization_id: organizationId,
      });

      if (filters) {
        if (filters.status) {
          const statuses = Array.isArray(filters.status)
            ? filters.status
            : [filters.status];
          statuses.forEach((s) => params.append('status', s));
        }
        if (filters.customer_phone) params.set('customer_phone', filters.customer_phone);
        if (filters.catalog_id) params.set('catalog_id', filters.catalog_id);
        if (filters.payment_provider) params.set('payment_provider', filters.payment_provider);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.limit) params.set('limit', filters.limit.toString());
        if (filters.offset) params.set('offset', filters.offset.toString());
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a single order by ID
   */
  static async getOrder(orderId: string): Promise<WhatsAppOrder> {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(
    organizationId: string,
    order: CreateOrderRequest
  ): Promise<WhatsAppOrder> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          ...order,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(
    orderId: string,
    updates: UpdateOrderRequest
  ): Promise<WhatsAppOrder> {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete an order
   */
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // ==========================================================================
  // ORDER ACTIONS
  // ==========================================================================

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<WhatsAppOrder> {
    return this.updateOrder(orderId, { status, notes });
  }

  /**
   * Send payment link for an order
   */
  static async sendPaymentLink(
    orderId: string,
    provider: string,
    customerPhone: string
  ): Promise<{ payment_link: string; message_id: string }> {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          customer_phone: customerPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending payment link:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation message
   */
  static async sendConfirmation(
    orderId: string,
    customerPhone: string
  ): Promise<{ message_id: string }> {
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_phone: customerPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending confirmation:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<WhatsAppOrder> {
    return this.updateOrder(orderId, {
      status: 'cancelled',
      notes: reason,
    });
  }

  // ==========================================================================
  // ORDER STATISTICS
  // ==========================================================================

  /**
   * Get order statistics
   */
  static async getOrderStats(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
    currency: string;
  }> {
    try {
      const params = new URLSearchParams({
        organization_id: organizationId,
      });

      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const response = await fetch(`/api/orders/stats?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }
}

export default OrdersService;
