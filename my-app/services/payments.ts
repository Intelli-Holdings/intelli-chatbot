/**
 * Payment Service
 * Handles payment provider configuration, link generation, and transaction management
 * Supports: Paystack, Flutterwave, MPESA, MOMO
 */

import type {
  PaymentProvider,
  PaymentConfigResponse,
  CreatePaymentConfigRequest,
  UpdatePaymentConfigRequest,
  PaymentLink,
  CreatePaymentLinkRequest,
  PaymentTransaction,
  TransactionQueryFilters,
  TransactionStats,
  TestConfigResult,
} from '@/types/payments';

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

export class PaymentService {
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
  // PAYMENT CONFIGURATION
  // ==========================================================================

  /**
   * Get all payment configurations for an organization
   */
  static async getConfigs(organizationId: string): Promise<PaymentConfigResponse[]> {
    try {
      const response = await fetch(
        `/api/payments/config?organizationId=${encodeURIComponent(organizationId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data = await response.json();
      return data.configs || [];
    } catch (error) {
      console.error('Error fetching payment configs:', error);
      throw error;
    }
  }

  /**
   * Get a specific payment configuration
   */
  static async getConfig(configId: string): Promise<PaymentConfigResponse> {
    try {
      const response = await fetch(`/api/payments/config/${configId}`, {
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
      console.error('Error fetching payment config:', error);
      throw error;
    }
  }

  /**
   * Create a new payment configuration
   */
  static async createConfig(
    organizationId: string,
    config: CreatePaymentConfigRequest
  ): Promise<PaymentConfigResponse> {
    try {
      const response = await fetch('/api/payments/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          ...config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment config:', error);
      throw error;
    }
  }

  /**
   * Update an existing payment configuration
   */
  static async updateConfig(
    configId: string,
    updates: UpdatePaymentConfigRequest
  ): Promise<PaymentConfigResponse> {
    try {
      const response = await fetch(`/api/payments/config/${configId}`, {
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
      console.error('Error updating payment config:', error);
      throw error;
    }
  }

  /**
   * Delete a payment configuration
   */
  static async deleteConfig(configId: string): Promise<void> {
    try {
      const response = await fetch(`/api/payments/config/${configId}`, {
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
      console.error('Error deleting payment config:', error);
      throw error;
    }
  }

  /**
   * Test a payment configuration
   */
  static async testConfig(configId: string): Promise<TestConfigResult> {
    try {
      const response = await fetch(`/api/payments/config/${configId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: this.extractErrorMessage(errorData),
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing payment config:', error);
      return {
        success: false,
        message: this.extractErrorMessage(error),
      };
    }
  }

  // ==========================================================================
  // PAYMENT LINKS
  // ==========================================================================

  /**
   * Create a payment link for an order
   */
  static async createPaymentLink(
    organizationId: string,
    request: CreatePaymentLinkRequest
  ): Promise<PaymentLink> {
    try {
      const response = await fetch('/api/payments/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          ...request,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  /**
   * Get payment link details
   */
  static async getPaymentLink(linkId: string): Promise<PaymentLink> {
    try {
      const response = await fetch(`/api/payments/link/${linkId}`, {
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
      console.error('Error fetching payment link:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment link
   */
  static async cancelPaymentLink(linkId: string): Promise<void> {
    try {
      const response = await fetch(`/api/payments/link/${linkId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }
    } catch (error) {
      console.error('Error cancelling payment link:', error);
      throw error;
    }
  }

  // ==========================================================================
  // TRANSACTIONS
  // ==========================================================================

  /**
   * Get transactions for an organization
   */
  static async getTransactions(
    organizationId: string,
    filters?: TransactionQueryFilters
  ): Promise<{ transactions: PaymentTransaction[]; total: number }> {
    try {
      const params = new URLSearchParams({
        organizationId,
      });

      if (filters) {
        if (filters.provider) {
          const providers = Array.isArray(filters.provider)
            ? filters.provider
            : [filters.provider];
          providers.forEach((p) => params.append('provider', p));
        }
        if (filters.status) {
          const statuses = Array.isArray(filters.status)
            ? filters.status
            : [filters.status];
          statuses.forEach((s) => params.append('status', s));
        }
        if (filters.order_id) params.set('order_id', filters.order_id);
        if (filters.customer_phone) params.set('customer_phone', filters.customer_phone);
        if (filters.customer_email) params.set('customer_email', filters.customer_email);
        if (filters.reference) params.set('reference', filters.reference);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.min_amount) params.set('min_amount', filters.min_amount.toString());
        if (filters.max_amount) params.set('max_amount', filters.max_amount.toString());
        if (filters.limit) params.set('limit', filters.limit.toString());
        if (filters.offset) params.set('offset', filters.offset.toString());
      }

      const response = await fetch(`/api/payments/transactions?${params.toString()}`, {
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
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get a specific transaction
   */
  static async getTransaction(transactionId: string): Promise<PaymentTransaction> {
    try {
      const response = await fetch(`/api/payments/transactions/${transactionId}`, {
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
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(
    organizationId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<TransactionStats> {
    try {
      const params = new URLSearchParams({
        organizationId,
      });

      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const response = await fetch(`/api/payments/transactions/stats?${params.toString()}`, {
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
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  /**
   * Refund a transaction
   */
  static async refundTransaction(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentTransaction> {
    try {
      const response = await fetch(`/api/payments/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Verify webhook signature for Paystack
   */
  static verifyPaystackSignature(
    payload: string,
    signature: string,
    secretKey: string
  ): boolean {
    // This should be done server-side for security
    // Included here for reference
    if (typeof window !== 'undefined') {
      console.warn('Webhook signature verification should be done server-side');
      return false;
    }

    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
    return hash === signature;
  }

  /**
   * Verify webhook signature for Flutterwave
   */
  static verifyFlutterwaveSignature(
    payload: string,
    signature: string,
    secretHash: string
  ): boolean {
    // This should be done server-side for security
    if (typeof window !== 'undefined') {
      console.warn('Webhook signature verification should be done server-side');
      return false;
    }

    return signature === secretHash;
  }

  /**
   * Get webhook URL for a provider
   */
  static getWebhookUrl(organizationId: string, provider: PaymentProvider): string {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : API_BASE_URL;
    return `${baseUrl}/api/payments/webhooks/${provider}?org=${organizationId}`;
  }

  /**
   * Check if provider is available for organization
   */
  static async isProviderConfigured(
    organizationId: string,
    provider: PaymentProvider
  ): Promise<boolean> {
    try {
      const configs = await this.getConfigs(organizationId);
      return configs.some((c) => c.provider === provider && c.is_active);
    } catch {
      return false;
    }
  }
}

export default PaymentService;
