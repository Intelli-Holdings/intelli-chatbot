"use client";

import { useState, useEffect, useCallback } from "react";
import { BillingService } from "@/services/billing";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import type { SubscriptionState } from "@/types/billing";

export interface UseSubscriptionReturn {
  subscription: SubscriptionState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const organizationId = useActiveOrganizationId();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await BillingService.getSubscriptionStatus(organizationId);
      setSubscription(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load subscription";
      setError(message);
      console.error("useSubscription error:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, loading, error, refetch: fetchSubscription };
}
