/**
 * Enhanced useWhatsAppPhoneNumbers Hook
 * 
 * Fetches WhatsApp Business phone number details from Meta Graph API
 * with comprehensive field support, error handling, and fallback mechanisms.
 * 
 * @example
 * const { phoneNumbers, loading, error, refetch } = useWhatsAppPhoneNumbers(selectedAppService);
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchPhoneNumberDetails, 
  type PhoneNumberDetails,
  extractMessagingLimit,
  formatQualityRating,
  formatMessagingTier
} from '@/services/meta-graph-api';
import type { AppService } from '@/services/whatsapp';


export interface UseWhatsAppPhoneNumbersReturn {
  phoneNumbers: PhoneNumberDetails[] | null;
  phoneNumber: PhoneNumberDetails | null; // Single phone number details
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Utility helpers
  messagingLimit: number;
  formattedQualityRating: string;
  formattedTier: string;
}

/**
 * Hook to fetch and manage WhatsApp phone number details
 */
export function useWhatsAppPhoneNumbers(
  selectedAppService: AppService | null
): UseWhatsAppPhoneNumbersReturn {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberDetails[] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch phone number details from Meta Graph API
   */
  const fetchPhoneNumbers = useCallback(async () => {
    // Reset state if no app service selected
    if (!selectedAppService) {
      setPhoneNumbers(null);
      setPhoneNumber(null);
      setError(null);
      return;
    }

    const phoneNumberId = selectedAppService.phone_number_id;
    const accessToken = selectedAppService.access_token;

    // Validate required credentials
    if (!phoneNumberId || !accessToken) {
      setError('Missing phone number ID or access token');
      setPhoneNumbers(null);
      setPhoneNumber(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching phone number details for ID:', phoneNumberId);

      // Fetch detailed information for the specific phone number
      const data = await fetchPhoneNumberDetails(phoneNumberId, accessToken);

      if (!data) {
        throw new Error('No data returned from API');
      }

      // Set both single and array format for flexibility
      setPhoneNumber(data);
      setPhoneNumbers([data]);
      setError(null);

      console.log('✅ Successfully fetched phone number details');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phone numbers';
      console.error('❌ Error fetching WhatsApp phone numbers:', err);
      setError(errorMessage);
      setPhoneNumbers(null);
      setPhoneNumber(null);

      // Provide user-friendly error messages
      if (errorMessage.includes('token') || errorMessage.includes('401')) {
        setError('Invalid or expired access token. Please reconnect your WhatsApp Business Account.');
      } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        setError('Insufficient permissions. Ensure your access token has whatsapp_business_management permission.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError('Phone number not found. Verify the phone number ID is correct.');
      } else {
        setError(`Failed to load phone number details: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedAppService]);

  /**
   * Fetch on mount and when selectedAppService changes
   */
  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  // Calculate utility values
  const messagingLimit = phoneNumber ? extractMessagingLimit(phoneNumber) : 250;
  const formattedQualityRating = formatQualityRating(phoneNumber?.quality_rating);
  const formattedTier = formatMessagingTier(phoneNumber?.messaging_limit_tier);

  return {
    phoneNumbers,
    phoneNumber,
    loading,
    error,
    refetch,
    messagingLimit,
    formattedQualityRating,
    formattedTier,
  };
}