import { useState, useEffect } from 'react';
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
  approximateCharges: number;
  totalSent: number;
  totalDelivered: number;
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

  const fetchAnalytics = async () => {
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
      // Calculate time range (last N days)
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (timeRangeInDays * 24 * 60 * 60);

      // Fetch both messaging and conversation analytics in parallel
      const [messagingResponse, conversationResponse, phoneNumberLimits] = await Promise.allSettled([
        WhatsAppService.getMessagingAnalytics(appService, startTime, endTime, 'DAY'),
        WhatsAppService.getConversationAnalytics(appService, startTime, endTime, 'DAILY'),
        WhatsAppService.getPhoneNumberLimits(appService)
      ]);

      // Process messaging analytics
      let totalSent = 0;
      let totalDelivered = 0;

      if (messagingResponse.status === 'fulfilled' && messagingResponse.value?.analytics?.data_points) {
        messagingResponse.value.analytics.data_points.forEach(point => {
          totalSent += point.sent || 0;
          totalDelivered += point.delivered || 0;
        });
      }

      // Process conversation analytics
      let totalConversations = 0;
      let freeTierConversations = 0;
      let approximateCharges = 0;
      const conversationBreakdownMap: { [key: string]: ConversationBreakdown } = {};

      if (conversationResponse.status === 'fulfilled' && conversationResponse.value?.conversation_analytics?.data) {
        conversationResponse.value.conversation_analytics.data.forEach(dataset => {
          dataset.data_points.forEach(point => {
            totalConversations += point.conversation || 0;
            approximateCharges += point.cost || 0;
            
            if (point.conversation_type === 'FREE_TIER') {
              freeTierConversations += point.conversation || 0;
            }

            // Build conversation breakdown by category
            const category = point.conversation_category || 'UNKNOWN';
            if (!conversationBreakdownMap[category]) {
              conversationBreakdownMap[category] = {
                category,
                conversations: 0,
                cost: 0
              };
            }
            conversationBreakdownMap[category].conversations += point.conversation || 0;
            conversationBreakdownMap[category].cost += point.cost || 0;
          });
        });
      }

      const conversationBreakdown = Object.values(conversationBreakdownMap);

      // Process phone number limits
      let phoneNumberLimitsData: PhoneNumberLimit[] = [];
      if (phoneNumberLimits.status === 'fulfilled') {
        phoneNumberLimitsData = phoneNumberLimits.value;
      } else {
        // Fallback to app service data if phone numbers fetch fails
        phoneNumberLimitsData = [{
          phone_number: appService.phone_number || 'Unknown',
          name: appService.name || 'WhatsApp Business',
          country: 'Unknown',
          business_initiated_conversations: 0,
          limit: 250
        }];
      }

      const analyticsSummary: AnalyticsSummary = {
        totalConversations,
        freeTierConversations,
        approximateCharges: Math.round(approximateCharges * 100) / 100, // Round to 2 decimal places
        totalSent,
        totalDelivered,
        phoneNumberLimits: phoneNumberLimitsData,
        conversationBreakdown
      };

      setAnalytics(analyticsSummary);

      // Log any partial failures for debugging
      if (messagingResponse.status === 'rejected') {
        console.warn('Failed to fetch messaging analytics:', messagingResponse.reason);
      }
      if (conversationResponse.status === 'rejected') {
        console.warn('Failed to fetch conversation analytics:', conversationResponse.reason);
      }
      if (phoneNumberLimits.status === 'rejected') {
        console.warn('Failed to fetch phone number limits:', phoneNumberLimits.reason);
      }

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
  };

  useEffect(() => {
    if (appService) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appService, timeRangeInDays]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export default useWhatsAppAnalytics;
