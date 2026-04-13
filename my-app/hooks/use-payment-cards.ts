"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  PaymentMethod,
  PaymentMethodCard,
  PaymentMethodBillingDetails,
  CardBrand,
  CardFunding,
} from "@/types/billing";

/** Raw shape returned by Stripe's API / our /api/stripe/payment-methods route */
interface StripePaymentMethodRaw {
  id: string;
  type?: string;
  card?: {
    brand: string;
    display_brand?: string | null;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding?: string;
    country?: string | null;
    fingerprint?: string | null;
    checks?: {
      address_line1_check?: string | null;
      address_postal_code_check?: string | null;
      cvc_check?: string | null;
    } | null;
    three_d_secure_usage?: { supported: boolean } | null;
    wallet?: { type: string; dynamic_last4?: string | null } | null;
    networks?: { available?: string[]; preferred?: string | null } | null;
  };
  billing_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
      line1?: string | null;
      line2?: string | null;
      postal_code?: string | null;
      state?: string | null;
    } | null;
  };
  created?: number;
  livemode?: boolean;
}

function mapRawToPaymentMethod(
  pm: StripePaymentMethodRaw,
  defaultId?: string | null
): PaymentMethod {
  const rawCard = pm.card;
  const card: PaymentMethodCard | null = rawCard
    ? {
        brand: (rawCard.brand || "unknown") as CardBrand,
        display_brand: rawCard.display_brand ?? null,
        last4: rawCard.last4,
        exp_month: rawCard.exp_month,
        exp_year: rawCard.exp_year,
        funding: (rawCard.funding || "unknown") as CardFunding,
        country: rawCard.country ?? null,
        fingerprint: rawCard.fingerprint ?? null,
        checks: rawCard.checks
          ? {
              address_line1_check: rawCard.checks.address_line1_check ?? null,
              address_postal_code_check:
                rawCard.checks.address_postal_code_check ?? null,
              cvc_check: rawCard.checks.cvc_check ?? null,
            }
          : null,
        three_d_secure_usage: rawCard.three_d_secure_usage ?? null,
        wallet: rawCard.wallet
          ? {
              type: rawCard.wallet.type as PaymentMethodCard["wallet"] extends { type: infer T } ? T : never,
              dynamic_last4: rawCard.wallet.dynamic_last4 ?? null,
            }
          : null,
        networks: rawCard.networks
          ? {
              available: rawCard.networks.available ?? [],
              preferred: rawCard.networks.preferred ?? null,
            }
          : null,
      }
    : null;

  const rawBilling = pm.billing_details;
  const billing_details: PaymentMethodBillingDetails = {
    name: rawBilling?.name ?? null,
    email: rawBilling?.email ?? null,
    phone: rawBilling?.phone ?? null,
    address: rawBilling?.address
      ? {
          city: rawBilling.address.city ?? null,
          country: rawBilling.address.country ?? null,
          line1: rawBilling.address.line1 ?? null,
          line2: rawBilling.address.line2 ?? null,
          postal_code: rawBilling.address.postal_code ?? null,
          state: rawBilling.address.state ?? null,
        }
      : null,
  };

  return {
    id: pm.id,
    type: pm.type || "card",
    card,
    billing_details,
    created: pm.created ?? 0,
    livemode: pm.livemode ?? false,
    is_default: pm.id === defaultId,
  };
}

interface UsePaymentCardsResult {
  customerId: string | null;
  cards: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  addCard: (paymentMethod: StripePaymentMethodRaw) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
  setDefaultCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<void>;
}

export const usePaymentCards = (
  customerId?: string | null
): UsePaymentCardsResult => {
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultId, setDefaultId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/stripe/payment-methods?customerId=${customerId}`
      );
      if (!res.ok) throw new Error("Failed to fetch payment methods");
      const data = await res.json();

      const rawMethods: StripePaymentMethodRaw[] = data.paymentMethods ?? [];
      const detectedDefault = data.defaultPaymentMethod ?? null;
      setDefaultId(detectedDefault);

      const mapped = rawMethods.map((pm) =>
        mapRawToPaymentMethod(pm, detectedDefault)
      );
      setCards(mapped);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch payment methods"
      );
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = useCallback(
    async (paymentMethod: StripePaymentMethodRaw) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/stripe/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            customerId,
          }),
        });

        if (!res.ok) throw new Error("Failed to add payment method");
        await fetchCards();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add payment method";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [customerId, fetchCards]
  );

  const removeCard = useCallback(
    async (cardId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const card = cards.find((c) => c.id === cardId);
        if (card?.is_default && cards.length > 1) {
          throw new Error(
            "Cannot remove default payment method. Please set another card as default first."
          );
        }

        const res = await fetch(
          `/api/stripe/payment-methods?paymentMethodId=${cardId}`,
          { method: "DELETE" }
        );

        if (!res.ok) throw new Error("Failed to remove payment method");
        setCards((prev) => prev.filter((c) => c.id !== cardId));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove payment method";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cards]
  );

  const setDefaultCard = useCallback(
    async (cardId: string) => {
      try {
        const res = await fetch("/api/stripe/payment-methods", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethodId: cardId, customerId }),
        });
        if (!res.ok) throw new Error("Failed to set default payment method");
        setDefaultId(cardId);
        setCards((prev) =>
          prev.map((c) => ({ ...c, is_default: c.id === cardId }))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to set default payment method";
        setError(errorMessage);
        throw err;
      }
    },
    [customerId]
  );

  return {
    customerId: customerId ?? null,
    cards,
    isLoading,
    error,
    addCard,
    removeCard,
    setDefaultCard,
    refreshCards: fetchCards,
  };
};
