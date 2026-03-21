import { commerceFetch, COMMERCE_URL } from '@/lib/commerce-api';

export interface CouponData {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency: string;
  min_order_amount: number;
  max_discount_amount: number | null;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  is_valid: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency?: string;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  max_uses?: number;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  min_order_amount?: number;
  description?: string;
}

export class CouponService {
  static async getCoupons(orgId: string, activeOnly = false): Promise<{ coupons: CouponData[] }> {
    const params = activeOnly ? '?active=true' : '';
    const resp = await commerceFetch(`${COMMERCE_URL(orgId)}/coupons/${params}`);
    if (!resp.ok) throw new Error('Failed to fetch coupons');
    return resp.json();
  }

  static async createCoupon(orgId: string, data: CreateCouponRequest): Promise<CouponData> {
    const resp = await commerceFetch(`${COMMERCE_URL(orgId)}/coupons/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create coupon');
    }
    return resp.json();
  }

  static async validateCoupon(orgId: string, code: string, orderAmount?: number): Promise<CouponValidationResult> {
    const resp = await commerceFetch(`${COMMERCE_URL(orgId)}/coupons/validate/`, {
      method: 'POST',
      body: JSON.stringify({ code, order_amount: orderAmount }),
    });
    return resp.json();
  }
}
