import { useState, useEffect, useCallback } from 'react';
import { 
  WhatsAppService, 
  type AppService, 
  type MessagingAnalyticsResponse,
  type ConversationAnalyticsResponse,
  type PhoneNumberLimit 
} from '@/services/whatsapp';

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
  phoneNumberLimits: PhoneNumberLimit[];
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
      // Add more country codes as needed
    };

    for (const [prefix, country] of Object.entries(countryPrefixes)) {
      if (phoneNumber.startsWith(`+${prefix}`)) {
        return country;
      }
    }
    return 'US'; // Default
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
      // Fetch conversation analytics using direct API calls for better accuracy
      const conversationsUrl = `https://graph.facebook.com/v18.0/${appService.whatsapp_business_account_id}`;
      const conversationsParams = new URLSearchParams({
        access_token: appService.access_token,
        fields: `conversation_analytics.start(${timeRangeInDays}).end(0).granularity(DAILY).phone_numbers(ALL).dimensions(CONVERSATION_CATEGORY,CONVERSATION_TYPE,COUNTRY,PHONE)`,
      });

      // Fetch phone number limits and current usage with additional fields
      const phoneNumbersUrl = `https://graph.facebook.com/v18.0/${appService.whatsapp_business_account_id}/phone_numbers`;
      const phoneNumbersParams = new URLSearchParams({
        access_token: appService.access_token,
        fields: 'id,display_phone_number,verified_name,quality_rating,messaging_limit,current_limit,status'
      });

      // Also fetch messaging analytics for sent/delivered stats
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

            // Calculate approximate charges using improved pricing model
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

      // Process phone number limits with per-phone business-initiated conversations
      let phoneNumberLimitsData: PhoneNumberLimit[] = [];
      if (phoneNumbersResponse.status === 'fulfilled') {
        const phoneNumbersData = await phoneNumbersResponse.value.json();
        
        // Log the phone numbers response for debugging
        console.log('Phone numbers API response:', phoneNumbersData);
        
        // Create a map of business-initiated conversations per phone number
        const phoneConversationMap: { [phoneNumber: string]: number } = {};
        
        // Use the already parsed conversationsData instead of parsing again
        if (conversationsData) {
          console.log('Conversations API response structure:', {
            hasConversationAnalytics: !!conversationsData?.conversation_analytics,
            hasData: !!conversationsData?.conversation_analytics?.data,
            dataLength: conversationsData?.conversation_analytics?.data?.length || 0
          });
          
          if (conversationsData?.conversation_analytics?.data) {
            conversationsData.conversation_analytics.data.forEach((item: any) => {
              console.log('Processing conversation item:', {
                type: item.conversation_type,
                phone: item.phone,
                conversations: item.conversation,
                category: item.conversation_category
              });
              
              if (item.conversation_type === 'BUSINESS_INITIATED' && item.phone) {
                const conversations = parseInt(item.conversation || 0);
                phoneConversationMap[item.phone] = (phoneConversationMap[item.phone] || 0) + conversations;
              }
            });
          }
        }
        
        console.log('Phone conversation map:', phoneConversationMap);
        
        phoneNumberLimitsData = phoneNumbersData?.data?.map((phone: any) => {
          const phoneNumber = phone.display_phone_number;
          const businessInitiatedForPhone = phoneConversationMap[phoneNumber] || 0;
          
          console.log(`Processing phone ${phoneNumber}:`, {
            name: phone.verified_name,
            limit: phone.messaging_limit?.max,
            businessInitiated: businessInitiatedForPhone,
            qualityRating: phone.quality_rating
          });
          
          return {
            phone_number: phoneNumber,
            name: phone.verified_name || 'Unknown',
            quality_rating: phone.quality_rating || 'UNKNOWN',
            limit: phone.messaging_limit?.max || 250,
            business_initiated_conversations: businessInitiatedForPhone,
            country: extractCountryFromPhoneNumber(phoneNumber)
          };
        }) || [];
      } else {
        console.warn('Phone numbers fetch failed, using fallback data');
        // Fallback to app service data if phone numbers fetch fails
        phoneNumberLimitsData = [{
          phone_number: appService.phone_number || 'Unknown',
          name: appService.name || 'WhatsApp Business',
          country: 'Unknown',
          business_initiated_conversations: businessInitiatedConversations,
          limit: 250,
          quality_rating: 'UNKNOWN'
        }];
      }

      const analyticsSummary: AnalyticsSummary = {
        totalConversations,
        freeTierConversations,
        businessInitiatedConversations,
        approximateCharges: Math.round(approximateCharges * 100) / 100, // Round to 2 decimal places
        totalSent,
        totalDelivered,
        totalRead: 0, // Not available in current API structure
        phoneNumberLimits: phoneNumberLimitsData,
        conversationBreakdown
      };

      setAnalytics(analyticsSummary);

      // Log any partial failures for debugging
      if (conversationsResponse.status === 'rejected') {
        console.warn('Failed to fetch conversation analytics:', conversationsResponse.reason);
      } else {
        console.log('Conversation analytics fetched successfully');
      }
      
      if (phoneNumbersResponse.status === 'rejected') {
        console.warn('Failed to fetch phone number limits:', phoneNumbersResponse.reason);
      } else {
        console.log('Phone number data fetched successfully');
      }
      
      if (messagingResponse.status === 'rejected') {
        console.warn('Failed to fetch messaging analytics:', messagingResponse.reason);
      } else {
        console.log('Messaging analytics fetched successfully');
      }

      // Log the final analytics summary for debugging
      console.log('Final analytics summary:', {
        totalConversations,
        freeTierConversations,
        businessInitiatedConversations,
        totalSent,
        totalDelivered,
        phoneNumberCount: phoneNumberLimitsData.length,
        conversationBreakdownCount: conversationBreakdown.length
      });

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
  }, [appService, timeRangeInDays, calculateConversationCost, extractCountryFromPhoneNumber]);

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
