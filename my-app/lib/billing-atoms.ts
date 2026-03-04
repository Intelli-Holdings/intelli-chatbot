import { atom } from "jotai";
import type { SubscriptionState, AddOn } from "@/types/billing";

// ---------------------------------------------------------------------------
// Subscription state atom
// ---------------------------------------------------------------------------

interface SubscriptionAtomState {
  data: SubscriptionState | null;
  loading: boolean;
  error: string | null;
}

export const subscriptionAtom = atom<SubscriptionAtomState>({
  data: null,
  loading: true,
  error: null,
});

// ---------------------------------------------------------------------------
// Add-on catalog atom (rarely changes, cached globally)
// ---------------------------------------------------------------------------

interface AddOnCatalogState {
  data: AddOn[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

export const addOnCatalogAtom = atom<AddOnCatalogState>({
  data: [],
  loading: false,
  error: null,
  fetchedAt: null,
});

/** Cache duration for add-on catalog (5 minutes) */
export const ADDON_CACHE_TTL = 5 * 60 * 1000;
