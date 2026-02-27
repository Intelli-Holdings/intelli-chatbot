import type {
  Plan,
  AddOn,
  SubscriptionState,
  StripeCheckoutResponse,
  StripeCheckoutRequest,
  MpesaCheckoutResponse,
  MpesaCheckoutRequest,
  Transaction,
  Invoice,
  CreditBalance,
  BillingInterval,
} from "@/types/billing";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.intelliconcierge.com";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    try {
      // @ts-expect-error - Clerk is loaded globally
      const clerk = window.Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch {
      // No auth token available
    }
  }

  return headers;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const authHeaders = await getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json();
}

export class BillingService {
  // -----------------------------------------------------------------------
  // Catalog (public)
  // -----------------------------------------------------------------------

  static async getPlans(): Promise<Plan[]> {
    return apiFetch<Plan[]>("/subscriptions/plans/");
  }

  static async getAddOns(): Promise<AddOn[]> {
    return apiFetch<AddOn[]>("/subscriptions/addons/");
  }

  // -----------------------------------------------------------------------
  // Subscription status
  // -----------------------------------------------------------------------

  static async getSubscriptionStatus(orgId: string): Promise<SubscriptionState> {
    return apiFetch<SubscriptionState>(`/subscriptions/org/${orgId}/status/`);
  }

  // -----------------------------------------------------------------------
  // Checkout
  // -----------------------------------------------------------------------

  static async startTrial(
    orgId: string,
    planId: string,
    billingInterval: BillingInterval
  ): Promise<{ message: string }> {
    return apiFetch(`/subscriptions/org/${orgId}/start-trial/`, {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, billing_interval: billingInterval }),
    });
  }

  static async createStripeCheckout(
    orgId: string,
    data: StripeCheckoutRequest
  ): Promise<StripeCheckoutResponse> {
    return apiFetch<StripeCheckoutResponse>(
      `/subscriptions/org/${orgId}/checkout/stripe/`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  static async createMpesaCheckout(
    orgId: string,
    data: MpesaCheckoutRequest
  ): Promise<MpesaCheckoutResponse> {
    return apiFetch<MpesaCheckoutResponse>(
      `/subscriptions/org/${orgId}/checkout/mpesa/`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  // -----------------------------------------------------------------------
  // Plan management
  // -----------------------------------------------------------------------

  static async changePlan(
    orgId: string,
    planId: string,
    billingInterval: BillingInterval
  ): Promise<{ message: string }> {
    return apiFetch(`/subscriptions/org/${orgId}/change-plan/`, {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, billing_interval: billingInterval }),
    });
  }

  static async cancelSubscription(orgId: string): Promise<{ message: string }> {
    return apiFetch(`/subscriptions/org/${orgId}/cancel/`, { method: "POST" });
  }

  static async reactivateSubscription(orgId: string): Promise<{ message: string }> {
    return apiFetch(`/subscriptions/org/${orgId}/reactivate/`, { method: "POST" });
  }

  static async openCustomerPortal(orgId: string, returnUrl: string): Promise<string> {
    const data = await apiFetch<{ portal_url: string }>(
      `/subscriptions/org/${orgId}/portal/`,
      { method: "POST", body: JSON.stringify({ return_url: returnUrl }) }
    );
    return data.portal_url;
  }

  // -----------------------------------------------------------------------
  // Add-ons
  // -----------------------------------------------------------------------

  static async manageAddOns(
    orgId: string,
    addonId: string,
    action: "add" | "remove",
    quantity?: number
  ): Promise<{ message: string }> {
    return apiFetch(`/subscriptions/org/${orgId}/addons/`, {
      method: "POST",
      body: JSON.stringify({ addon_id: addonId, action, quantity }),
    });
  }

  // -----------------------------------------------------------------------
  // History
  // -----------------------------------------------------------------------

  static async getTransactions(orgId: string): Promise<Transaction[]> {
    return apiFetch<Transaction[]>(`/subscriptions/org/${orgId}/transactions/`);
  }

  static async getInvoices(orgId: string): Promise<Invoice[]> {
    return apiFetch<Invoice[]>(`/subscriptions/org/${orgId}/invoices/`);
  }

  static async getInvoiceDownloadUrl(orgId: string, invoiceId: string): Promise<string> {
    const data = await apiFetch<{ download_url: string }>(
      `/subscriptions/org/${orgId}/invoices/${invoiceId}/download/`
    );
    return data.download_url;
  }

  // -----------------------------------------------------------------------
  // Credits
  // -----------------------------------------------------------------------

  static async getCreditUsage(orgId: string): Promise<CreditBalance> {
    return apiFetch<CreditBalance>(`/subscriptions/org/${orgId}/credits/`);
  }

  // -----------------------------------------------------------------------
  // M-Pesa status polling
  // -----------------------------------------------------------------------

  static async pollMpesaStatus(
    orgId: string,
    checkoutRequestId: string
  ): Promise<{ status: "pending" | "completed" | "failed"; message: string }> {
    return apiFetch(
      `/subscriptions/org/${orgId}/checkout/mpesa/status/?checkout_request_id=${checkoutRequestId}`
    );
  }
}
