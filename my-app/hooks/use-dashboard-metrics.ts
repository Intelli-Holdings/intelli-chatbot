import { useState, useEffect, useCallback } from 'react';
import {
  getMetricsSummary,
  getDateRangeForPeriod,
  type MetricsSummary,
  type DashboardStats,
} from '@/services/metrics';

export type TimePeriod = 'today' | 'week' | 'month' | 'all';

export interface UseDashboardMetricsReturn {
  stats: DashboardStats | null;
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
      const dateRange = getDateRangeForPeriod(period);
      const summary: MetricsSummary = await getMetricsSummary(organizationId, dateRange);

      // Check if there's any data
      if (!summary.latest || summary.summary.record_count === 0) {
        setIsEmpty(true);
        setStats(null);
        setLoading(false);
        return;
      }

      setIsEmpty(false);
      const latest = summary.latest;
      const timeline = summary.timeline || [];

      // Transform the data into DashboardStats format
      const dashboardStats: DashboardStats = {
        // Contact metrics (we'll need to add these from contact API later)
        totalContacts: 0, // TODO: Fetch from contacts API
        needFollowUp: latest.num_pending || 0,
        converted: latest.num_resolved || 0,
        inboundLeads: latest.num_escalations || 0,

        // Conversation metrics
        totalConversations: latest.num_conversations || 0,
        activeConversations: latest.num_pending + latest.num_assigned || 0,
        avgResponseTime: '2.3 mins', // TODO: Calculate from actual data

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
          whatsapp: latest.conversations_per_channel?.channels?.whatsapp || 0,
          website: latest.conversations_per_channel?.channels?.website || 0,
          email: latest.conversations_per_channel?.channels?.email || 0,
          instagram: latest.conversations_per_channel?.channels?.instagram || 0,
          messenger: latest.conversations_per_channel?.channels?.messenger || 0,
        },

        // Recent escalations (mock data - would come from a separate API)
        recentEscalations: generateRecentEscalations(latest.num_escalations),

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
    } catch (err) {
      let errorMessage = 'Failed to fetch dashboard metrics';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    stats,
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

/**
 * Generate mock recent escalations (would come from API)
 */
function generateRecentEscalations(count: number): DashboardStats['recentEscalations'] {
  if (count === 0) return [];

  const messages = [
    'Customer complaint about delivery delay',
    'Product quality issue reported',
    'Billing inquiry requires attention',
    'Technical support request',
    'Refund request pending review',
  ];

  return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
    id: `escalation-${i}`,
    priority: i === 0 ? ('high' as const) : i === 1 ? ('medium' as const) : ('low' as const),
    message: messages[i % messages.length],
    timestamp: `${Math.floor(Math.random() * 60)} mins ago`,
  }));
}

export default useDashboardMetrics;
