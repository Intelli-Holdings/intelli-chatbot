import { useState, useEffect, useCallback } from 'react';
import {
  WhatsAppService,
  type AppService,
  type MessagingAnalyticsResponse,
  type ConversationAnalyticsResponse,
  type PhoneNumberLimit
} from '@/services/whatsapp';
import { logger } from "@/lib/logger";

export interface PhoneNumberProfile {
  id: string;
  display_phone_number: string;
  display_name?: string;
  verified_name?: string;
  quality_rating?: string;
  messaging_limit?: {
    max: number;
    tier?: string;
  };
  code_verification_status?: string;
  status?: string;
  current_limit?: number;
  business_initiated_conversations?: number;
  country?: string;
}

export interface ConversationBreakdown {
  category: string;
  conversations: number;
  cost: number;
}

export interface AnalyticsSummary {
  totalConversations: number;
  freeTierConversations: number;
  businessInitiatedConversations: number;
  approximateCharges: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  phoneNumberProfiles: PhoneNumberProfile[];
  conversationBreakdown: ConversationBreakdown[];
}

export interface UseWhatsAppAnalyticsReturn {
  analytics: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch WhatsApp analytics for an app service
 */
export const useWhatsAppAnalytics = (
  appService: AppService | null,
  timeRangeInDays: number = 30
): UseWhatsAppAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to calculate conversation costs
  const calculateConversationCost = useCallback((
    category: string,
    type: string,
    count: number,
    country: string
  ): number => {
    // Simplified pricing model - adjust based on actual Meta pricing
    const pricing: Record<string, Record<string, number>> = {
      MARKETING: { US: 0.0639, IN: 0.0099, DEFAULT: 0.0439 },
      UTILITY: { US: 0.0218, IN: 0.0042, DEFAULT: 0.0158 },
      AUTHENTICATION: { US: 0.0109, IN: 0.0021, DEFAULT: 0.0079 },
      SERVICE: { US: 0.0218, IN: 0.0042, DEFAULT: 0.0158 }
    };

    const categoryPricing = pricing[category] || pricing.UTILITY;
    const rate = categoryPricing[country] || categoryPricing.DEFAULT;

    // First 1000 user-initiated conversations are free
    if (type === 'USER_INITIATED') {
      const billableCount = Math.max(0, count - 1000);
      return billableCount * rate;
    }

    return count * rate;
  }, []);

  // Helper function to extract country code from phone number
  const extractCountryFromPhoneNumber = useCallback((phoneNumber: string): string => {
    // Simple mapping - enhance with proper library
    const countryPrefixes: Record<string, string> = {
      '1': 'US',
      '44': 'GB',
      '91': 'IN',
      '221': 'SN',
      '256': 'UG', // Uganda
      // Add more country codes as needed
    };

    for (const [prefix, country] of Object.entries(countryPrefixes)) {
      if (phoneNumber.startsWith(`+${prefix}`)) {
        return country;
      }
    }
    return 'US'; // Default
  }, []);

  // Helper function to determine messaging tier based on limit
  const determineMessagingTier = useCallback((limit: number): string => {
    if (limit >= 100000) return 'TIER_4';
    if (limit >= 10000) return 'TIER_3';
    if (limit >= 1000) return 'TIER_2';
    return 'TIER_1';
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!appService) {
      setError('No app service selected');
      return;
    }

    if (!appService.access_token) {
      setError('Access token is missing for the selected app service');
      return;
    }

    if (!appService.whatsapp_business_account_id) {
      setError('WhatsApp Business Account ID is missing for the selected app service');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const graphApiVersion = 'v18.0';
      const wabaId = appService.whatsapp_business_account_id;
      const accessToken = appService.access_token;

      // Fetch conversation analytics
      const conversationsUrl = `https://graph.facebook.com/${graphApiVersion}/${wabaId}`;
      const conversationsParams = new URLSearchParams({
        access_token: accessToken,
        fields: `conversation_analytics.start(${timeRangeInDays}).end(0).granularity(DAILY).phone_numbers(ALL).dimensions(CONVERSATION_CATEGORY,CONVERSATION_TYPE,COUNTRY,PHONE)`,
      });

      // Fetch messaging analytics
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (timeRangeInDays * 24 * 60 * 60);

      // Fetch all data in parallel using Promise.allSettled
      const [conversationsResponse, phoneNumbersResponse, messagingResponse] = await Promise.allSettled([
        fetch(`${conversationsUrl}?${conversationsParams}`),
        WhatsAppService.fetchPhoneNumbers(appService),
        WhatsAppService.getMessagingAnalytics(appService, startTime, endTime, 'DAY')
      ]);

      // Process conversation analytics
      let totalConversations = 0;
      let freeTierConversations = 0;
      let businessInitiatedConversations = 0;
      let approximateCharges = 0;
      const conversationBreakdownMap: { [key: string]: ConversationBreakdown } = {};
      let conversationsData: any = null;

      if (conversationsResponse.status === 'fulfilled') {
        conversationsData = await conversationsResponse.value.json();

        if (conversationsData?.conversation_analytics?.data) {
          // Track user-initiated conversations separately for free tier calculation
          let totalUserInitiatedConversations = 0;

          conversationsData.conversation_analytics.data.forEach((dataItem: any) => {
            // Each dataItem contains metadata (type, category, country, phone) and data_points array
            const conversationType = dataItem.conversation_type;
            const conversationCategory = dataItem.conversation_category;
            const country = dataItem.country;
            const phone = dataItem.phone;

            // Process each data point (time-series data)
            if (dataItem.data_points && Array.isArray(dataItem.data_points)) {
              dataItem.data_points.forEach((point: any) => {
                const conversations = parseInt(point.conversation || 0);
                const apiCost = parseFloat(point.cost || 0);

                // Accumulate total conversations
                totalConversations += conversations;

                // Track user-initiated conversations for free tier
                if (conversationType === 'USER_INITIATED') {
                  totalUserInitiatedConversations += conversations;
                }

                // Track business-initiated conversations
                if (conversationType === 'BUSINESS_INITIATED') {
                  businessInitiatedConversations += conversations;
                }

                // Use API-provided cost if available, otherwise calculate
                let cost = apiCost;
                if (cost === 0 && conversations > 0) {
                  // Fallback to manual calculation if API doesn't provide cost
                  cost = calculateConversationCost(
                    conversationCategory,
                    conversationType,
                    conversations,
                    country
                  );
                }
                approximateCharges += cost;

                // Build conversation breakdown by category
                const category = conversationCategory || 'UNKNOWN';
                if (!conversationBreakdownMap[category]) {
                  conversationBreakdownMap[category] = {
                    category,
                    conversations: 0,
                    cost: 0
                  };
                }
                conversationBreakdownMap[category].conversations += conversations;
                conversationBreakdownMap[category].cost += cost;
              });
            }
          });

          // Calculate free tier conversations (first 1000 user-initiated per month are free)
          freeTierConversations = Math.min(totalUserInitiatedConversations, 1000);
        }
      }

      const conversationBreakdown = Object.values(conversationBreakdownMap);

      // Process messaging analytics
      let totalSent = 0;
      let totalDelivered = 0;

      if (messagingResponse.status === 'fulfilled' && messagingResponse.value?.analytics?.data_points) {
        messagingResponse.value.analytics.data_points.forEach(point => {
          totalSent += point.sent || 0;
          totalDelivered += point.delivered || 0;
        });
      }

      // Process phone number profiles with enhanced data
      let phoneNumberProfiles: PhoneNumberProfile[] = [];
      const phoneNumbersData: any[] = phoneNumbersResponse.status === 'fulfilled'
        ? phoneNumbersResponse.value
        : [];

      if (phoneNumbersData && phoneNumbersData.length > 0) {
        // Create a map of business-initiated conversations per phone number
        const phoneConversationMap: { [phoneNumber: string]: number } = {};

        if (conversationsData?.conversation_analytics?.data) {
          conversationsData.conversation_analytics.data.forEach((dataItem: any) => {
            if (dataItem.conversation_type === 'BUSINESS_INITIATED' && dataItem.phone) {
              // Sum conversations from all data_points for this phone
              if (dataItem.data_points && Array.isArray(dataItem.data_points)) {
                const totalForPhone = dataItem.data_points.reduce((sum: number, point: any) => {
                  return sum + parseInt(point.conversation || 0);
                }, 0);
                phoneConversationMap[dataItem.phone] = (phoneConversationMap[dataItem.phone] || 0) + totalForPhone;
              }
            }
          });
        }

        // Process each phone number to build comprehensive profiles
        // The data is already comprehensive from WhatsAppService.fetchPhoneNumbers()
        phoneNumberProfiles = phoneNumbersData.map((phone: any) => {
          const phoneNumber = phone.display_phone_number || phone.phone_number;

          // Extract messaging limit from various possible fields
          let limit = 250; // Default
          if (phone.current_limit) {
            limit = phone.current_limit;
          } else if (phone.max_daily_conversation_per_phone) {
            limit = phone.max_daily_conversation_per_phone;
          } else if (phone.messaging_limit_tier) {
            // Derive from tier
            const tierLimits: Record<string, number> = {
              'TIER_1K': 1000,
              'TIER_10K': 10000,
              'TIER_100K': 100000,
              'TIER_UNLIMITED': 1000000,
              'STANDARD': 250,
            };
            limit = tierLimits[phone.messaging_limit_tier] || 250;
          }

          return {
            id: phone.id,
            display_phone_number: phoneNumber,
            display_name: phone.display_name || phone.name,
            verified_name: phone.verified_name,
            quality_rating: phone.quality_rating || 'UNKNOWN',
            messaging_limit: {
              max: limit,
              tier: determineMessagingTier(limit)
            },
            code_verification_status: phone.code_verification_status || phone.verification_status,
            status: 'ACTIVE', // Phone numbers returned are active
            current_limit: limit,
            business_initiated_conversations: phoneConversationMap[phoneNumber] || 0,
            country: extractCountryFromPhoneNumber(phoneNumber)
          } as PhoneNumberProfile;
        });
      }

      const analyticsSummary: AnalyticsSummary = {
        totalConversations,
        freeTierConversations,
        businessInitiatedConversations,
        approximateCharges: Math.round(approximateCharges * 100) / 100,
        totalSent,
        totalDelivered,
        totalRead: 0,
        phoneNumberProfiles,
        conversationBreakdown
      };

      setAnalytics(analyticsSummary);

    } catch (err) {
      let errorMessage = 'Failed to fetch analytics';
      
      if (err instanceof Error) {
        if (err.message.includes('Access token')) {
          errorMessage = 'Invalid access token. Please check your WhatsApp Business Account configuration.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to Meta Graph API. Please check your network connection.';
        } else if (err.message.includes('whatsapp_business_account_id')) {
          errorMessage = 'Invalid WhatsApp Business Account ID. Please verify your account configuration.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      logger.error('Error fetching WhatsApp analytics', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }, [appService, timeRangeInDays, calculateConversationCost, extractCountryFromPhoneNumber, determineMessagingTier]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export default useWhatsAppAnalytics;