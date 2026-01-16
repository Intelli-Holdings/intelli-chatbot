import { useState, useEffect, useCallback } from 'react';
import {
  getMetricsSummary,
  getDateRangeForPeriod,
  type MetricsSummary,
  type DashboardStats,
} from '@/services/metrics';
import { getContactsCount } from '@/services/contacts';
import { getRecentEscalations } from '@/services/notifications';

export type TimePeriod = 'today' | 'week' | 'month' | 'all';

export interface UseDashboardMetricsReturn {
  stats: DashboardStats | null;
  allTimeStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  refetch: () => Promise<void>;
  isEmpty: boolean;
}

/**
 * Custom hook to fetch and transform dashboard metrics
 */
export const useDashboardMetrics = (
  organizationId: string | null
): UseDashboardMetricsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allTimeStats, setAllTimeStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchMetrics = useCallback(async () => {
    if (!organizationId) {
      setError('No organization selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the period-specific data for display
      const dateRange = getDateRangeForPeriod(period);
      const summary: MetricsSummary = await getMetricsSummary(organizationId, dateRange);

      // Try to fetch all-time data, but fallback to summary if it fails
      let allTimeSummary: MetricsSummary;
      if (period === 'all') {
        allTimeSummary = summary;
      } else {
        try {
          const allTimeDateRange = getDateRangeForPeriod('all');
          allTimeSummary = await getMetricsSummary(organizationId, allTimeDateRange);
        } catch (allTimeError) {
          console.warn('[Dashboard Metrics] Failed to fetch all-time data, using period data as fallback:', allTimeError);
          // Fallback to period data
          allTimeSummary = summary;
        }
      }

      console.log('[Dashboard Metrics] Raw API response:', {
        hasSummary: !!summary,
        hasLatest: !!summary?.latest,
        latestData: summary?.latest,
        conversationsPerChannel: summary?.latest?.conversations_per_channel,
      });

      // Use latest data or create empty stats
      const latest = summary.latest || {
        num_conversations: 0,
        num_pending: 0,
        num_assigned: 0,
        num_resolved: 0,
        num_escalations: 0,
        num_messages: 0,
        used_token: 0,
        total_token: 0,
        conversations_per_channel: {
          channels: {
            whatsapp: 0,
            website: 0,
            email: 0,
            instagram: 0,
            messenger: 0,
          }
        }
      };
      const timeline = summary.timeline || [];

      // Helper function to extract channel conversation count
      // Handles both old nested structure and new simple structure
      const getChannelCount = (channelData: any): number => {
        if (!channelData) return 0;
        // New structure: simple number
        if (typeof channelData === 'number') return channelData;
        // Old structure: nested object with number_of_conversations
        if (typeof channelData === 'object' && channelData.number_of_conversations !== undefined) {
          return channelData.number_of_conversations;
        }
        return 0;
      };

      const whatsappCount = getChannelCount(latest.conversations_per_channel?.channels?.whatsapp);
      const websiteCount = getChannelCount(latest.conversations_per_channel?.channels?.website);
      const emailCount = getChannelCount(latest.conversations_per_channel?.channels?.email);
      const instagramCount = getChannelCount(latest.conversations_per_channel?.channels?.instagram);
      const messengerCount = getChannelCount(latest.conversations_per_channel?.channels?.messenger);

      // Check isEmpty based on ALL-TIME data, not period-filtered data
      const allTimeLatest = allTimeSummary.latest || latest;
      const allTimeWhatsapp = getChannelCount(allTimeLatest.conversations_per_channel?.channels?.whatsapp);
      const allTimeWebsite = getChannelCount(allTimeLatest.conversations_per_channel?.channels?.website);
      const hasActivity = allTimeLatest.num_conversations > 0 || allTimeWhatsapp > 0 || allTimeWebsite > 0;

      console.log('[Dashboard Metrics] Activity check:', {
        period,
        period_conversations: latest.num_conversations,
        period_messages: latest.num_messages,
        alltime_conversations: allTimeLatest.num_conversations,
        alltime_messages: allTimeLatest.num_messages,
        alltime_whatsapp: allTimeWhatsapp,
        alltime_website: allTimeWebsite,
        hasActivity,
        isEmpty: !hasActivity
      });

      setIsEmpty(!hasActivity);

      // Fetch additional data in parallel
      const [contactsCount, recentEscalationsData] = await Promise.all([
        getContactsCount(organizationId),
        getRecentEscalations(organizationId, 3),
      ]);

      // Calculate average response time if we have messages data
      // Note: This is a simplified calculation. For accurate response time,
      // the backend should calculate it based on message timestamps
      const avgResponseTime = latest.num_messages > 0 ? 'N/A' : 'N/A';

      // Transform the data into DashboardStats format
      const dashboardStats: DashboardStats = {
        // Contact metrics - now using real data
        totalContacts: contactsCount,
        needFollowUp: latest.num_pending || 0,
        converted: latest.num_resolved || 0,
        inboundLeads: latest.num_escalations || 0,

        // Conversation metrics
        totalConversations: latest.num_conversations || 0,
        totalMessages: latest.num_messages || 0,
        activeConversations: (latest.num_pending || 0) + (latest.num_assigned || 0),
        avgResponseTime, // Note: Backend should calculate this from message timestamps

        // Token metrics
        tokensUsed: latest.used_token || 0,
        tokensLimit: latest.total_token || 0,
        tokenUsagePercent: latest.total_token > 0
          ? Math.round((latest.used_token / latest.total_token) * 100)
          : 0,
        estimatedCost: calculateTokenCost(latest.used_token),

        // Escalation metrics
        totalEscalations: latest.num_escalations || 0,
        pendingEscalations: latest.num_pending || 0,
        assignedTickets: latest.num_assigned || 0,
        resolvedTickets: latest.num_resolved || 0,

        // Channel breakdown
        channelStats: {
          whatsapp: whatsappCount,
          website: websiteCount,
          email: emailCount,
          instagram: instagramCount,
          messenger: messengerCount,
        },

        // Recent escalations - now using real data from notifications API
        recentEscalations: recentEscalationsData,

        // Timeline trends
        conversationTrend: timeline.map((metric) => ({
          date: new Date(metric.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          count: metric.num_conversations || 0,
        })),

        messageTrend: timeline.map((metric) => ({
          date: new Date(metric.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          count: metric.num_messages || 0,
        })),
      };

      setStats(dashboardStats);

      // Also create and store all-time stats for the empty state
      const allTimeTimeline = allTimeSummary.timeline || [];
      const allTimeStatsData: DashboardStats = {
        totalContacts: contactsCount,
        needFollowUp: allTimeLatest.num_pending || 0,
        converted: allTimeLatest.num_resolved || 0,
        inboundLeads: allTimeLatest.num_escalations || 0,
        totalConversations: allTimeLatest.num_conversations || 0,
        totalMessages: allTimeLatest.num_messages || 0,
        activeConversations: (allTimeLatest.num_pending || 0) + (allTimeLatest.num_assigned || 0),
        avgResponseTime,
        tokensUsed: allTimeLatest.used_token || 0,
        tokensLimit: allTimeLatest.total_token || 0,
        tokenUsagePercent: allTimeLatest.total_token > 0
          ? Math.round((allTimeLatest.used_token / allTimeLatest.total_token) * 100)
          : 0,
        estimatedCost: calculateTokenCost(allTimeLatest.used_token),
        totalEscalations: allTimeLatest.num_escalations || 0,
        pendingEscalations: allTimeLatest.num_pending || 0,
        assignedTickets: allTimeLatest.num_assigned || 0,
        resolvedTickets: allTimeLatest.num_resolved || 0,
        channelStats: {
          whatsapp: allTimeWhatsapp,
          website: allTimeWebsite,
          email: getChannelCount(allTimeLatest.conversations_per_channel?.channels?.email),
          instagram: getChannelCount(allTimeLatest.conversations_per_channel?.channels?.instagram),
          messenger: getChannelCount(allTimeLatest.conversations_per_channel?.channels?.messenger),
        },
        recentEscalations: recentEscalationsData,
        conversationTrend: allTimeTimeline.map((metric) => ({
          date: new Date(metric.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          count: metric.num_conversations || 0,
        })),
        messageTrend: allTimeTimeline.map((metric) => ({
          date: new Date(metric.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          count: metric.num_messages || 0,
        })),
      };

      setAllTimeStats(allTimeStatsData);
    } catch (err) {
      let errorMessage = 'Failed to fetch dashboard metrics';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Don't break the UI for backend errors - set empty state
      setStats(null);
      setAllTimeStats(null);
      setIsEmpty(true);
      setError(errorMessage);
      console.error('[Dashboard Metrics] Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    stats,
    allTimeStats,
    loading,
    error,
    period,
    setPeriod,
    refetch: fetchMetrics,
    isEmpty,
  };
};

/**
 * Calculate estimated token cost (simplified)
 */
function calculateTokenCost(tokensUsed: number): number {
  // Simplified cost calculation: $0.01 per 1000 tokens
  return Math.round((tokensUsed / 1000) * 0.01 * 100) / 100;
}

export default useDashboardMetrics;
