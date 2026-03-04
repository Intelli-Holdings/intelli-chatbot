"use client";

import { useState, useCallback, useEffect } from 'react';

export interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  holderName: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  stripePaymentMethodId?: string;
}

interface UsePaymentCardsResult {
  customerId: string | null;
  cards: PaymentCard[];
  isLoading: boolean;
  error: string | null;
  addCard: (paymentMethod: StripePaymentMethod, isDefault?: boolean) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
  setDefaultCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<void>;
}

interface StripePaymentMethod {
  id: string;
  card: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string | null;
  };
}

export const usePaymentCards = (customerId?: string | null): UsePaymentCardsResult => {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`);
      if (!res.ok) throw new Error("Failed to fetch payment methods");
      const data = await res.json();

      const mapped: PaymentCard[] = (data.paymentMethods ?? []).map((pm: StripePaymentMethod & { id: string }) => ({
        id: pm.id,
        last4: pm.card.last4,
        brand: pm.card.brand,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: false,
        holderName: pm.billing_details.name || "Unknown",
        type: pm.card.brand as PaymentCard["type"],
        stripePaymentMethodId: pm.id,
      }));

      setCards(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment methods");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = useCallback(async (paymentMethod: StripePaymentMethod, isDefault = false) => {
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

      if (isDefault && cards.length > 0) {
        setCards(prev => prev.map(c => ({ ...c, isDefault: false })));
      }

      await fetchCards();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customerId, cards.length, fetchCards]);

  const removeCard = useCallback(async (cardId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const card = cards.find(c => c.id === cardId);
      if (card?.isDefault) {
        throw new Error('Cannot remove default payment method. Please set another card as default first.');
      }

      const res = await fetch(`/api/stripe/payment-methods?paymentMethodId=${cardId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove payment method");

      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cards]);

  const setDefaultCard = useCallback(async (cardId: string) => {
    setCards(prev =>
      prev.map(card => ({
        ...card,
        isDefault: card.id === cardId,
      }))
    );
  }, []);

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
