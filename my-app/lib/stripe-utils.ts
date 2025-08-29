import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with restricted key for enhanced security
export const getStripe = () => {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_RESTRICTED_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripeKey) {
    throw new Error('Stripe key is not defined. Please set NEXT_PUBLIC_STRIPE_RESTRICTED_KEY or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  
  return loadStripe(stripeKey);
};

// API helper functions
export const stripeAPI = {
  async createSetupIntent(customerId?: string) {
    const response = await fetch('/api/stripe/setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create setup intent');
    }

    return response.json();
  },

  async savePaymentMethod(paymentMethodId: string, customerId: string) {
    const response = await fetch('/api/stripe/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethodId, customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment method');
    }

    return response.json();
  },

  async getPaymentMethods(customerId: string) {
    const response = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`);

    if (!response.ok) {
      throw new Error('Failed to retrieve payment methods');
    }

    return response.json();
  },

  async removePaymentMethod(paymentMethodId: string) {
    const response = await fetch(`/api/stripe/payment-methods?paymentMethodId=${paymentMethodId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove payment method');
    }

    return response.json();
  },
};

// Utility functions
export const formatCardBrand = (brand: string): string => {
  switch (brand.toLowerCase()) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'American Express';
    case 'discover':
      return 'Discover';
    case 'diners':
      return 'Diners Club';
    case 'jcb':
      return 'JCB';
    case 'unionpay':
      return 'UnionPay';
    default:
      return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
};

export const getCardIcon = (brand: string): string => {
  switch (brand.toLowerCase()) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'amex':
      return '💳';
    case 'discover':
      return '💳';
    default:
      return '💳';
  }
};

export const maskCardNumber = (last4: string): string => {
  return `•••• •••• •••• ${last4}`;
};

export const formatExpiryDate = (month: number, year: number): string => {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
};
