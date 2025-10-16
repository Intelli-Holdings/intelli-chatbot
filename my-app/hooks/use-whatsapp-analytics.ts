import { useState, useEffect, useCallback } from 'react';
import { 
  WhatsAppService, 
  type AppService, 
  type MessagingAnalyticsResponse,
  type ConversationAnalyticsResponse,
  type PhoneNumberLimit 
} from '@/services/whatsapp';

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

      // Fetch phone numbers with detailed profile information
      const phoneNumbersUrl = `https://graph.facebook.com/${graphApiVersion}/${wabaId}/phone_numbers`;
      const phoneNumbersParams = new URLSearchParams({
        access_token: accessToken,
        fields: 'id,display_phone_number,verified_name,quality_rating,messaging_limit,current_limit,status'
      });

      // Fetch messaging analytics
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (timeRangeInDays * 24 * 60 * 60);

      const [conversationsResponse, phoneNumbersResponse, messagingResponse] = await Promise.allSettled([
        fetch(`${conversationsUrl}?${conversationsParams}`),
        fetch(`${phoneNumbersUrl}?${phoneNumbersParams}`),
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
          conversationsData.conversation_analytics.data.forEach((item: any) => {
            const conversations = parseInt(item.conversation || 0);
            totalConversations += conversations;

            // Track free tier conversations (first 1000 user-initiated)
            if (item.conversation_type === 'USER_INITIATED') {
              freeTierConversations += Math.min(conversations, 1000);
            }

            if (item.conversation_type === 'BUSINESS_INITIATED') {
              businessInitiatedConversations += conversations;
            }

            // Calculate approximate charges
            const cost = calculateConversationCost(
              item.conversation_category,
              item.conversation_type,
              conversations,
              item.country
            );
            approximateCharges += cost;

            // Build conversation breakdown
            const category = item.conversation_category || 'UNKNOWN';
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
      const phoneNumbersData: any = phoneNumbersResponse.status === 'fulfilled' 
        ? await phoneNumbersResponse.value.json() 
        : null;

      if (phoneNumbersData?.data) {
        // Create a map of business-initiated conversations per phone number
        const phoneConversationMap: { [phoneNumber: string]: number } = {};
        
        if (conversationsData?.conversation_analytics?.data) {
          conversationsData.conversation_analytics.data.forEach((item: any) => {
            if (item.conversation_type === 'BUSINESS_INITIATED' && item.phone) {
              const conversations = parseInt(item.conversation || 0);
              phoneConversationMap[item.phone] = (phoneConversationMap[item.phone] || 0) + conversations;
            }
          });
        }

        // Fetch additional profile data for each phone number
        const phoneProfilePromises = phoneNumbersData.data.map(async (phone: any) => {
          try {
            // Fetch detailed profile information for each phone number
            const phoneDetailUrl = `https://graph.facebook.com/${graphApiVersion}/${phone.id}`;
            const phoneDetailParams = new URLSearchParams({
              access_token: accessToken,
              fields: 'id,display_name,display_phone_number,quality_rating,code_verification_status,verified_name,messaging_limit,status,current_limit'
            });

            const phoneDetailResponse = await fetch(`${phoneDetailUrl}?${phoneDetailParams}`);
            const phoneDetail = await phoneDetailResponse.json();

            const phoneNumber = phoneDetail.display_phone_number || phone.display_phone_number;
            const limit = phoneDetail.messaging_limit?.max || phone.messaging_limit?.max || 250;

            return {
              id: phoneDetail.id || phone.id,
              display_phone_number: phoneNumber,
              display_name: phoneDetail.display_name,
              verified_name: phoneDetail.verified_name || phone.verified_name,
              quality_rating: phoneDetail.quality_rating || phone.quality_rating || 'UNKNOWN',
              messaging_limit: {
                max: limit,
                tier: determineMessagingTier(limit)
              },
              code_verification_status: phoneDetail.code_verification_status,
              status: phoneDetail.status || phone.status || 'ACTIVE',
              current_limit: phoneDetail.current_limit || phone.current_limit,
              business_initiated_conversations: phoneConversationMap[phoneNumber] || 0,
              country: extractCountryFromPhoneNumber(phoneNumber)
            } as PhoneNumberProfile;
          } catch (error) {
            console.warn(`Failed to fetch details for phone ${phone.id}:`, error);
            // Return basic data if detailed fetch fails
            const phoneNumber = phone.display_phone_number;
            const limit = phone.messaging_limit?.max || 250;
            return {
              id: phone.id,
              display_phone_number: phoneNumber,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating || 'UNKNOWN',
              messaging_limit: {
                max: limit,
                tier: determineMessagingTier(limit)
              },
              status: phone.status || 'ACTIVE',
              business_initiated_conversations: phoneConversationMap[phoneNumber] || 0,
              country: extractCountryFromPhoneNumber(phoneNumber)
            } as PhoneNumberProfile;
          }
        });

        phoneNumberProfiles = await Promise.all(phoneProfilePromises);
      } else {
        // Fallback to app service data if phone numbers fetch fails
        phoneNumberProfiles = [{
          id: 'fallback',
          display_phone_number: appService.phone_number || 'Unknown',
          verified_name: appService.name || 'WhatsApp Business',
          country: 'Unknown',
          business_initiated_conversations: businessInitiatedConversations,
          messaging_limit: {
            max: 250,
            tier: 'TIER_1'
          },
          quality_rating: 'UNKNOWN',
          status: 'ACTIVE'
        }];
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
      console.error('Error fetching WhatsApp analytics:', err);
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