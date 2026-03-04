"use client";

import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { BillingService } from "@/services/billing";
import { addOnCatalogAtom, ADDON_CACHE_TTL } from "@/lib/billing-atoms";
import type { AddOn } from "@/types/billing";

export interface UseAddOnCatalogReturn {
  addons: AddOn[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAddOnCatalog(): UseAddOnCatalogReturn {
  const [state, setState] = useAtom(addOnCatalogAtom);

  const fetchAddOns = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await BillingService.getAddOns();
      setState({ data, loading: false, error: null, fetchedAt: Date.now() });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load add-ons";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [setState]);

  useEffect(() => {
    const isStale = !state.fetchedAt || Date.now() - state.fetchedAt > ADDON_CACHE_TTL;
    if (state.data.length === 0 && state.error === null && !state.loading) {
      fetchAddOns();
    } else if (isStale && !state.loading) {
      fetchAddOns();
    }
  }, [fetchAddOns, state.data.length, state.error, state.loading, state.fetchedAt]);

  return {
    addons: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchAddOns,
  };
}
