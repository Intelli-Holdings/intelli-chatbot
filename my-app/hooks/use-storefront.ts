import { useState, useEffect, useCallback } from 'react';
import { StorefrontService } from '@/services/storefront';
import type { StorefrontData, UpdateStorefrontRequest } from '@/services/storefront';
import useActiveOrganizationId from './use-organization-id';

export const useStorefront = () => {
  const organizationId = useActiveOrganizationId();
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStorefront = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await StorefrontService.getStorefront(organizationId);
      setStorefront(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storefront');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const updateStorefront = useCallback(async (data: UpdateStorefrontRequest): Promise<StorefrontData> => {
    if (!organizationId) throw new Error('Organization not available');
    setSaving(true);
    try {
      const updated = await StorefrontService.updateStorefront(organizationId, data);
      setStorefront(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) fetchStorefront();
  }, [organizationId, fetchStorefront]);

  return { storefront, loading, error, saving, refetch: fetchStorefront, updateStorefront };
};
