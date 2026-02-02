/**
 * Payment Types
 * Types for payment providers, transactions, and configurations
 * Supporting African markets: MPESA, MOMO, Paystack, Flutterwave
 */

// =============================================================================
// PAYMENT PROVIDER TYPES
// =============================================================================

/**
 * Supported payment providers
 */
export type PaymentProvider = 'paystack' | 'flutterwave' | 'mpesa' | 'momo';

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'charge.success'
  | 'charge.failed'
  | 'transfer.success'
  | 'transfer.failed'
  | 'refund.processed';

// =============================================================================
// PAYMENT CONFIGURATION
// =============================================================================

/**
 * Base payment configuration
 */
export interface PaymentConfigBase {
  id: string;
  organization_id: string;
  provider: PaymentProvider;
  is_active: boolean;
  is_test_mode: boolean;
  webhook_url: string;
  supported_currencies: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Paystack configuration
 */
export interface PaystackConfig extends PaymentConfigBase {
  provider: 'paystack';
  public_key: string;
  // secret_key stored securely in backend
}

/**
 * Flutterwave configuration
 */
export interface FlutterwaveConfig extends PaymentConfigBase {
  provider: 'flutterwave';
  public_key: string;
  // secret_key and encryption_key stored securely in backend
}

/**
 * MPESA configuration (direct or via Flutterwave)
 */
export interface MPESAConfig extends PaymentConfigBase {
  provider: 'mpesa';
  business_shortcode: string;
  environment: 'sandbox' | 'production';
  // consumer_key, consumer_secret, passkey stored securely in backend
}

/**
 * MTN Mobile Money configuration (via Flutterwave)
 */
export interface MOMOConfig extends PaymentConfigBase {
  provider: 'momo';
  // Integrated through Flutterwave
}

/**
 * Union type for all payment configs
 */
export type PaymentConfig =
  | PaystackConfig
  | FlutterwaveConfig
  | MPESAConfig
  | MOMOConfig;

/**
 * Payment config for API responses (sanitized, no secrets)
 */
export interface PaymentConfigResponse {
  id: string;
  organization_id: string;
  provider: PaymentProvider;
  is_active: boolean;
  is_test_mode: boolean;
  webhook_url: string;
  supported_currencies: string[];
  public_key?: string;
  business_shortcode?: string;
  environment?: 'sandbox' | 'production';
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PAYMENT CONFIG FORMS
// =============================================================================

/**
 * Create Paystack config request
 */
export interface CreatePaystackConfigRequest {
  provider: 'paystack';
  public_key: string;
  secret_key: string;
  is_test_mode: boolean;
}

/**
 * Create Flutterwave config request
 */
export interface CreateFlutterwaveConfigRequest {
  provider: 'flutterwave';
  public_key: string;
  secret_key: string;
  encryption_key: string;
  is_test_mode: boolean;
}

/**
 * Create MPESA config request
 */
export interface CreateMPESAConfigRequest {
  provider: 'mpesa';
  consumer_key: string;
  consumer_secret: string;
  business_shortcode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

/**
 * Create MOMO config request
 */
export interface CreateMOMOConfigRequest {
  provider: 'momo';
  // Uses Flutterwave credentials
  flutterwave_config_id: string;
}

/**
 * Union type for create config requests
 */
export type CreatePaymentConfigRequest =
  | CreatePaystackConfigRequest
  | CreateFlutterwaveConfigRequest
  | CreateMPESAConfigRequest
  | CreateMOMOConfigRequest;

/**
 * Update payment config request
 */
export interface UpdatePaymentConfigRequest {
  is_active?: boolean;
  is_test_mode?: boolean;
  public_key?: string;
  secret_key?: string;
  encryption_key?: string;
  consumer_key?: string;
  consumer_secret?: string;
  passkey?: string;
  environment?: 'sandbox' | 'production';
}

// =============================================================================
// PAYMENT LINKS
// =============================================================================

/**
 * Payment link
 */
export interface PaymentLink {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  url: string;
  reference: string;
  status: PaymentStatus;
  expires_at?: string;
  created_at: string;
}

/**
 * Create payment link request
 */
export interface CreatePaymentLinkRequest {
  order_id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  redirect_url?: string;
  callback_url?: string;
}

// =============================================================================
// PAYMENT TRANSACTIONS
// =============================================================================

/**
 * Payment transaction
 */
export interface PaymentTransaction {
  id: string;
  organization_id: string;
  order_id?: string;
  provider: PaymentProvider;
  reference: string;
  provider_reference?: string;
  amount: number;
  currency: string;
  fee?: number;
  net_amount?: number;
  status: PaymentStatus;
  customer_phone?: string;
  customer_email?: string;
  customer_name?: string;
  payment_method?: string;
  metadata?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * Transaction query filters
 */
export interface TransactionQueryFilters {
  provider?: PaymentProvider | PaymentProvider[];
  status?: PaymentStatus | PaymentStatus[];
  order_id?: string;
  customer_phone?: string;
  customer_email?: string;
  reference?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
  offset?: number;
}

/**
 * Transaction statistics
 */
export interface TransactionStats {
  total_count: number;
  total_amount: number;
  successful_count: number;
  successful_amount: number;
  failed_count: number;
  pending_count: number;
  refunded_count: number;
  refunded_amount: number;
  currency: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * Paystack webhook event
 */
export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response: string;
    paid_at?: string;
    channel?: string;
    customer?: {
      email: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

/**
 * Flutterwave webhook event
 */
export interface FlutterwaveWebhookEvent {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    payment_type: string;
    charged_amount: number;
    app_fee: number;
    customer: {
      email: string;
      phone_number?: string;
      name?: string;
    };
    meta?: Record<string, unknown>;
  };
}

/**
 * MPESA callback event (STK Push)
 */
export interface MPESACallbackEvent {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

// =============================================================================
// PROVIDER INFO
// =============================================================================

/**
 * Payment provider information
 */
export interface PaymentProviderInfo {
  id: PaymentProvider;
  name: string;
  description: string;
  logo?: string;
  supported_countries: string[];
  supported_currencies: string[];
  payment_methods: string[];
  features: string[];
  docs_url: string;
}

/**
 * Payment provider details
 */
export const PAYMENT_PROVIDERS: Record<PaymentProvider, PaymentProviderInfo> = {
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    description: 'Accept payments from customers in Africa',
    supported_countries: ['NG', 'GH', 'KE', 'ZA'],
    supported_currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD'],
    payment_methods: ['Card', 'Bank Transfer', 'USSD', 'QR', 'Mobile Money'],
    features: ['Instant settlement', 'Split payments', 'Subscriptions'],
    docs_url: 'https://paystack.com/docs',
  },
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Pan-African payments infrastructure',
    supported_countries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'RW', 'CM'],
    supported_currencies: [
      'NGN',
      'GHS',
      'KES',
      'ZAR',
      'UGX',
      'TZS',
      'RWF',
      'XAF',
      'USD',
      'EUR',
      'GBP',
    ],
    payment_methods: [
      'Card',
      'Bank Transfer',
      'MPESA',
      'Mobile Money',
      'USSD',
      'Barter',
    ],
    features: [
      'Multi-currency',
      'Split payments',
      'Subscriptions',
      'Virtual cards',
    ],
    docs_url: 'https://developer.flutterwave.com',
  },
  mpesa: {
    id: 'mpesa',
    name: 'M-PESA',
    description: 'Mobile money service in Kenya',
    supported_countries: ['KE'],
    supported_currencies: ['KES'],
    payment_methods: ['STK Push', 'Paybill', 'Till'],
    features: ['Instant payments', 'Reversals', 'Transaction status'],
    docs_url: 'https://developer.safaricom.co.ke',
  },
  momo: {
    id: 'momo',
    name: 'MTN Mobile Money',
    description: 'Mobile money across Africa via Flutterwave',
    supported_countries: ['GH', 'UG', 'RW', 'CM'],
    supported_currencies: ['GHS', 'UGX', 'RWF', 'XAF'],
    payment_methods: ['Mobile Money'],
    features: ['Instant payments', 'Disbursements'],
    docs_url: 'https://developer.flutterwave.com/docs/collecting-payments/mobile-money',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Get status color for UI
 */
export const getStatusColor = (
  status: PaymentStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
    case 'processing':
      return 'secondary';
    case 'failed':
    case 'cancelled':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'secondary';
  }
};

/**
 * Format currency amount
 */
export const formatPaymentAmount = (
  amount: number,
  currency: string
): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  try {
    return formatter.format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Validate payment provider for a currency
 */
export const isProviderSupportedForCurrency = (
  provider: PaymentProvider,
  currency: string
): boolean => {
  const providerInfo = PAYMENT_PROVIDERS[provider];
  return providerInfo?.supported_currencies.includes(currency) ?? false;
};

/**
 * Get available providers for a currency
 */
export const getProvidersForCurrency = (currency: string): PaymentProvider[] => {
  return (Object.keys(PAYMENT_PROVIDERS) as PaymentProvider[]).filter(
    (provider) => isProviderSupportedForCurrency(provider, currency)
  );
};

/**
 * Test config result
 */
export interface TestConfigResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}
