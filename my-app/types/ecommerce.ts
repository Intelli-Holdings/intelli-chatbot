/**
 * WhatsApp Ecommerce Types
 * Types for catalogue management, products, orders, and commerce operations
 * Based on Meta's WhatsApp Commerce API documentation
 */

// =============================================================================
// CATALOGUE TYPES
// =============================================================================

/**
 * Meta Commerce Catalogue
 */
export interface MetaCatalogue {
  id: string;
  name: string;
  product_count?: number;
  is_connected?: boolean;
  vertical?: string;
  business?: {
    id: string;
    name: string;
  };
}

/**
 * Commerce Settings for a WhatsApp phone number
 */
export interface CommerceSettings {
  is_catalog_visible: boolean;
  is_cart_enabled: boolean;
  catalog_id?: string;
}

// =============================================================================
// PRODUCT TYPES
// =============================================================================

/**
 * Product availability status
 */
export type ProductAvailability = 'in stock' | 'out of stock' | 'available for order';

/**
 * Meta Product from catalogue
 */
export interface MetaProduct {
  id: string;
  retailer_id: string; // SKU - required for messages
  name: string;
  description?: string;
  price: number;
  currency: string;
  availability: ProductAvailability;
  image_url?: string;
  url?: string;
  brand?: string;
  category?: string;
  condition?: 'new' | 'refurbished' | 'used';
  sale_price?: number;
  sale_price_effective_date?: {
    start_date: string;
    end_date: string;
  };
}

/**
 * Query options for fetching products
 */
export interface ProductQueryOptions {
  limit?: number;
  after?: string; // Cursor for pagination
  fields?: string[];
}

/**
 * Product section for multi-product messages
 */
export interface ProductSection {
  title: string;
  product_items: { product_retailer_id: string }[];
}

// =============================================================================
// PRODUCT MESSAGE TYPES
// =============================================================================

/**
 * Single product message payload
 */
export interface SingleProductMessage {
  catalog_id: string;
  product_retailer_id: string;
  body_text?: string;
  footer_text?: string;
}

/**
 * Multi-product message payload (max 30 items)
 */
export interface MultiProductMessage {
  catalog_id: string;
  header_text: string;
  body_text: string;
  footer_text?: string;
  sections: ProductSection[];
}

/**
 * Product message response from Meta API
 */
export interface ProductMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

// =============================================================================
// ORDER TYPES
// =============================================================================

/**
 * Order status progression
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/**
 * Order item
 */
export interface OrderItem {
  product_retailer_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  currency: string;
  image_url?: string;
}

/**
 * WhatsApp Order
 */
export interface WhatsAppOrder {
  id: string;
  organization_id: string;
  catalog_id: string;
  customer_phone: string;
  customer_name?: string;
  items: OrderItem[];
  subtotal: number;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_id?: string;
  payment_provider?: string;
  payment_status?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Shipping address for orders
 */
export interface ShippingAddress {
  name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

/**
 * Order creation request
 */
export interface CreateOrderRequest {
  catalog_id: string;
  customer_phone: string;
  customer_name?: string;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Order update request
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  payment_id?: string;
  payment_provider?: string;
  payment_status?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Order query filters
 */
export interface OrderQueryFilters {
  status?: OrderStatus | OrderStatus[];
  customer_phone?: string;
  catalog_id?: string;
  payment_provider?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * WhatsApp Order webhook event from Meta
 */
export interface WhatsAppOrderWebhook {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'order';
          order: {
            catalog_id: string;
            text?: string;
            product_items: Array<{
              product_retailer_id: string;
              quantity: number;
              item_price: number;
              currency: string;
            }>;
          };
        }>;
      };
      field: 'messages';
    }>;
  }>;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Paginated response from Meta API
 */
export interface MetaPaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * Catalogue API response
 */
export type CataloguesResponse = MetaPaginatedResponse<MetaCatalogue>;

/**
 * Products API response
 */
export type ProductsResponse = MetaPaginatedResponse<MetaProduct>;

// =============================================================================
// COMMERCE LIMITS & CONSTANTS
// =============================================================================

/**
 * Commerce limits based on Meta API documentation
 */
export const COMMERCE_LIMITS = {
  /** Maximum products in a multi-product message */
  MAX_PRODUCTS_PER_MESSAGE: 30,
  /** Maximum sections in a multi-product message */
  MAX_SECTIONS_PER_MESSAGE: 10,
  /** Maximum products per section */
  MAX_PRODUCTS_PER_SECTION: 30,
  /** Maximum header text length */
  MAX_HEADER_TEXT_LENGTH: 60,
  /** Maximum body text length */
  MAX_BODY_TEXT_LENGTH: 1024,
  /** Maximum footer text length */
  MAX_FOOTER_TEXT_LENGTH: 60,
  /** Maximum section title length */
  MAX_SECTION_TITLE_LENGTH: 24,
} as const;

/**
 * Supported currencies for African markets
 */
export const SUPPORTED_CURRENCIES = {
  // Nigeria
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  // Kenya
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  // Ghana
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  // South Africa
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  // Uganda
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  // Tanzania
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  // Rwanda
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  // Cameroon (CFA Franc)
  XAF: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
  // International
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate product retailer ID (SKU)
 */
export const validateRetailerId = (retailerId: string): boolean => {
  return typeof retailerId === 'string' && retailerId.length > 0 && retailerId.length <= 100;
};

/**
 * Validate multi-product message sections
 */
export const validateProductSections = (sections: ProductSection[]): { valid: boolean; error?: string } => {
  if (!sections || sections.length === 0) {
    return { valid: false, error: 'At least one section is required' };
  }

  if (sections.length > COMMERCE_LIMITS.MAX_SECTIONS_PER_MESSAGE) {
    return { valid: false, error: `Maximum ${COMMERCE_LIMITS.MAX_SECTIONS_PER_MESSAGE} sections allowed` };
  }

  let totalProducts = 0;
  for (const section of sections) {
    if (!section.title || section.title.length > COMMERCE_LIMITS.MAX_SECTION_TITLE_LENGTH) {
      return { valid: false, error: `Section title must be 1-${COMMERCE_LIMITS.MAX_SECTION_TITLE_LENGTH} characters` };
    }

    if (!section.product_items || section.product_items.length === 0) {
      return { valid: false, error: 'Each section must have at least one product' };
    }

    if (section.product_items.length > COMMERCE_LIMITS.MAX_PRODUCTS_PER_SECTION) {
      return { valid: false, error: `Maximum ${COMMERCE_LIMITS.MAX_PRODUCTS_PER_SECTION} products per section` };
    }

    totalProducts += section.product_items.length;
  }

  if (totalProducts > COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE) {
    return { valid: false, error: `Maximum ${COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE} products total` };
  }

  return { valid: true };
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency: SupportedCurrency): string => {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  if (!currencyInfo) {
    return `${currency} ${amount.toFixed(2)}`;
  }
  return `${currencyInfo.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (items: OrderItem[]): { subtotal: number; currency: string } => {
  if (!items || items.length === 0) {
    return { subtotal: 0, currency: 'USD' };
  }

  const currency = items[0].currency;
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return { subtotal, currency };
};
