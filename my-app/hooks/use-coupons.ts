import { useState, useEffect, useCallback } from 'react';
import { CouponService } from '@/services/coupon';
import type { CouponData, CreateCouponRequest, CouponValidationResult } from '@/services/coupon';
import useActiveOrganizationId from './use-organization-id';

export const useCoupons = () => {
  const organizationId = useActiveOrganizationId();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await CouponService.getCoupons(organizationId);
      setCoupons(data.coupons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const createCoupon = useCallback(async (data: CreateCouponRequest): Promise<CouponData> => {
    if (!organizationId) throw new Error('Organization not available');
    setSaving(true);
    try {
      const coupon = await CouponService.createCoupon(organizationId, data);
      setCoupons((prev) => [coupon, ...prev]);
      return coupon;
    } finally {
      setSaving(false);
    }
  }, [organizationId]);

  const validateCoupon = useCallback(async (code: string, orderAmount?: number): Promise<CouponValidationResult> => {
    if (!organizationId) throw new Error('Organization not available');
    return CouponService.validateCoupon(organizationId, code, orderAmount);
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) fetchCoupons();
  }, [organizationId, fetchCoupons]);

  return { coupons, loading, error, saving, refetch: fetchCoupons, createCoupon, validateCoupon };
};
