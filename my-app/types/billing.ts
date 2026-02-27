// ---------------------------------------------------------------------------
// Enums / Union types
// ---------------------------------------------------------------------------

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type PaymentProvider = "stripe" | "mpesa";

export type BillingInterval = "monthly" | "yearly";

export type PlanCategory = "website_widget" | "whatsapp" | "enterprise";

export type AddOnType =
  | "ai_credits"
  | "automation_triggers"
  | "webhook"
  | "extra_whatsapp_number"
  | "extra_team_seat";

export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

// ---------------------------------------------------------------------------
// Plan catalog
// ---------------------------------------------------------------------------

export interface Plan {
  id: string;
  name: string;
  slug: string;
  category: PlanCategory;
  description: string;
  monthly_price: string; // Decimal string from Django
  yearly_price: string;
  stripe_monthly_price_id: string;
  stripe_yearly_price_id: string;
  max_contacts: number;
  max_team_members: number;
  max_whatsapp_numbers: number;
  monthly_ai_credits: number;
  monthly_automation_triggers: number;
  monthly_broadcasts: number;
  has_ai_assistant: boolean;
  has_live_chat: boolean;
  has_broadcasts: boolean;
  has_webhooks: boolean;
  has_api_access: boolean;
  has_custom_branding: boolean;
  has_analytics: boolean;
  has_priority_support: boolean;
  is_popular: boolean;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Add-on catalog
// ---------------------------------------------------------------------------

export interface AddOn {
  id: string;
  name: string;
  slug: string;
  addon_type: AddOnType;
  description: string;
  unit_price: string;
  unit_label: string;
  is_metered: boolean;
  stripe_price_id: string;
}

// ---------------------------------------------------------------------------
// Subscription state (from /subscriptions/org/{id}/status/)
// ---------------------------------------------------------------------------

export interface SubscriptionAddOn {
  id: string;
  addon: AddOn;
  quantity: number;
  is_active: boolean;
}

export interface CreditBalance {
  credits_allocated: number;
  credits_used: number;
  credits_purchased: number;
  credits_total: number;
  credits_remaining: number;
  usage_percentage: number;
  period_start: string;
  period_end: string;
}

export interface SubscriptionState {
  id: string;
  plan: Plan | null;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  payment_provider: PaymentProvider | "";
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  is_complimentary: boolean;
  complimentary_reason: string;
  is_usable: boolean;
  days_until_renewal: number | null;
  addons: SubscriptionAddOn[];
  credits: CreditBalance | null;
}

// ---------------------------------------------------------------------------
// Transactions & Invoices
// ---------------------------------------------------------------------------

export interface Transaction {
  id: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  payment_provider: PaymentProvider;
  provider_transaction_id: string;
  description: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  status: string;
  line_items: InvoiceLineItem[];
  stripe_invoice_pdf: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export interface StripeCheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface MpesaCheckoutResponse {
  checkout_request_id: string;
  merchant_request_id: string;
  response_description: string;
}

export interface MpesaCheckoutRequest {
  plan_id: string;
  billing_interval: BillingInterval;
  phone_number: string;
  country_code: string;
}

export interface StripeCheckoutRequest {
  plan_id: string;
  billing_interval: BillingInterval;
  success_url: string;
  cancel_url: string;
  addon_ids?: string[];
}
