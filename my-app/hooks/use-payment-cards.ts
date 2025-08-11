"use client";

import { useState, useCallback } from 'react';

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
  cards: PaymentCard[];
  isLoading: boolean;
  error: string | null;
  addCard: (paymentMethod: any, isDefault?: boolean) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;
  setDefaultCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<void>;
}

export const usePaymentCards = (): UsePaymentCardsResult => {
  const [cards, setCards] = useState<PaymentCard[]>([
    // Sample data - replace with actual API calls
    {
      id: '1',
      last4: '4242',
      brand: 'visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      holderName: 'John Doe',
      type: 'visa',
      stripePaymentMethodId: 'pm_1234567890',
    },
    {
      id: '2',
      last4: '5555',
      brand: 'mastercard',
      expMonth: 6,
      expYear: 2026,
      isDefault: false,
      holderName: 'John Doe',
      type: 'mastercard',
      stripePaymentMethodId: 'pm_0987654321',
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCard = useCallback(async (paymentMethod: any, isDefault = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would save this to your backend
      const newCard: PaymentCard = {
        id: Math.random().toString(36).substr(2, 9),
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        isDefault: isDefault,
        holderName: paymentMethod.billing_details.name || 'Unknown',
        type: paymentMethod.card.brand as 'visa' | 'mastercard' | 'amex' | 'discover',
        stripePaymentMethodId: paymentMethod.id,
      };

      setCards(prevCards => {
        // If this card is set as default, remove default from other cards
        let updatedCards = prevCards;
        if (isDefault) {
          updatedCards = prevCards.map(card => ({ ...card, isDefault: false }));
        }
        
        // Check if we're at the 4 card limit
        if (updatedCards.length >= 4) {
          throw new Error('You can only have up to 4 payment methods');
        }
        
        return [...updatedCards, newCard];
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCard = useCallback(async (cardId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cardToRemove = cards.find(card => card.id === cardId);
      
      if (cardToRemove?.isDefault) {
        throw new Error('Cannot remove default payment method. Please set another card as default first.');
      }
      
      // In a real app, you would make an API call to remove the card
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cards]);

  const setDefaultCard = useCallback(async (cardId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to update the default card
      setCards(prevCards => 
        prevCards.map(card => ({
          ...card,
          isDefault: card.id === cardId
        }))
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch cards from your backend
      // For now, we'll just keep the current state
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh payment methods';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cards,
    isLoading,
    error,
    addCard,
    removeCard,
    setDefaultCard,
    refreshCards,
  };
};
