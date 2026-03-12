"use client";

import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { BillingService } from "@/services/billing";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { subscriptionAtom } from "@/lib/billing-atoms";
import type { SubscriptionState } from "@/types/billing";

export interface UseSubscriptionReturn {
  subscription: SubscriptionState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const organizationId = useActiveOrganizationId();
  const [state, setState] = useAtom(subscriptionAtom);

  const fetchSubscription = useCallback(async () => {
    if (!organizationId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await BillingService.getSubscriptionStatus(organizationId);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load subscription";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      console.error("useSubscription error:", err);
    }
  }, [organizationId, setState]);

  useEffect(() => {
    // Only fetch if we haven't loaded yet or org changed
    if (state.data === null && state.error === null) {
      fetchSubscription();
    }
  }, [fetchSubscription, state.data, state.error]);

  return {
    subscription: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchSubscription,
  };
}
