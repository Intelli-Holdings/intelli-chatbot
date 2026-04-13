import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  getMetricsSummary,
  getDateRangeForPeriod,
  type MetricsSummary,
  type DashboardStats,
} from '@/services/metrics';
import { getContactsCount } from '@/services/contacts';
import { getRecentEscalations } from '@/services/notifications';
import { logger } from "@/lib/logger";

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
 * Helper to extract channel conversation count.
 * Handles both old nested structure and new simple structure.
 */
function getChannelCount(channelData: any): number {
  if (!channelData) return 0;
  if (typeof channelData === 'number') return channelData;
  if (typeof channelData === 'object' && channelData.number_of_conversations !== undefined) {
    return channelData.number_of_conversations;
  }
  return 0;
}

/**
 * Calculate estimated token cost (simplified)
 */
function calculateTokenCost(tokensUsed: number): number {
  return Math.round((tokensUsed / 1000) * 0.01 * 100) / 100;
}

/**
 * Transform a MetricsSummary into DashboardStats
 */
function buildDashboardStats(
  summary: MetricsSummary,
  contactsCount: number,
  recentEscalationsData: DashboardStats['recentEscalations'],
): DashboardStats {
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
      channels: { whatsapp: 0, website: 0, email: 0, instagram: 0, messenger: 0 },
    },
  };
  const timeline = summary.timeline || [];

  const avgResponseTime = latest.num_messages > 0 ? 'N/A' : 'N/A';

  return {
    totalContacts: contactsCount,
    needFollowUp: latest.num_pending || 0,
    converted: latest.num_resolved || 0,
    inboundLeads: latest.num_escalations || 0,
    totalConversations: latest.num_conversations || 0,
    totalMessages: latest.num_messages || 0,
    activeConversations: (latest.num_pending || 0) + (latest.num_assigned || 0),
    avgResponseTime,
    tokensUsed: latest.used_token || 0,
    tokensLimit: latest.total_token || 0,
    tokenUsagePercent: latest.total_token > 0
      ? Math.round((latest.used_token / latest.total_token) * 100)
      : 0,
    estimatedCost: calculateTokenCost(latest.used_token),
    totalEscalations: latest.num_escalations || 0,
    pendingEscalations: latest.num_pending || 0,
    assignedTickets: latest.num_assigned || 0,
    resolvedTickets: latest.num_resolved || 0,
    channelStats: {
      whatsapp: getChannelCount(latest.conversations_per_channel?.channels?.whatsapp),
      website: getChannelCount(latest.conversations_per_channel?.channels?.website),
      email: getChannelCount(latest.conversations_per_channel?.channels?.email),
      instagram: getChannelCount(latest.conversations_per_channel?.channels?.instagram),
      messenger: getChannelCount(latest.conversations_per_channel?.channels?.messenger),
    },
    recentEscalations: recentEscalationsData,
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
}

/**
 * Custom hook to fetch and transform dashboard metrics.
 * Uses React Query for parallel fetching, caching, and stale-while-revalidate.
 */
export const useDashboardMetrics = (
  organizationId: string | null
): UseDashboardMetricsReturn => {
  const [period, setPeriod] = useState<TimePeriod>('week');
  const queryClient = useQueryClient();

  const enabled = Boolean(organizationId);

  // 1. Period-specific metrics
  const periodQuery = useQuery(
    ['metrics', organizationId, period],
    async () => {
      const dateRange = getDateRangeForPeriod(period);
      return getMetricsSummary(organizationId!, dateRange);
    },
    {
      enabled,
      keepPreviousData: true,
      staleTime: 30 * 1000,
    }
  );

  // 2. All-time metrics (independent of period toggle)
  const allTimeQuery = useQuery(
    ['metrics-alltime', organizationId],
    async () => {
      const dateRange = getDateRangeForPeriod('all');
      return getMetricsSummary(organizationId!, dateRange);
    },
    {
      enabled,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  // 3. Contacts count (rarely changes)
  const contactsQuery = useQuery(
    ['contacts-count', organizationId],
    () => getContactsCount(organizationId!),
    {
      enabled,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  // 4. Recent escalations
  const escalationsQuery = useQuery(
    ['escalations', organizationId],
    () => getRecentEscalations(organizationId!, 3),
    {
      enabled,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

  // Derive combined state
  const loading = periodQuery.isLoading || allTimeQuery.isLoading ||
    contactsQuery.isLoading || escalationsQuery.isLoading;

  const error = useMemo(() => {
    const firstError = periodQuery.error || allTimeQuery.error ||
      contactsQuery.error || escalationsQuery.error;
    if (!firstError) return null;
    if (firstError instanceof Error) return firstError.message;
    return 'Failed to fetch dashboard metrics';
  }, [periodQuery.error, allTimeQuery.error, contactsQuery.error, escalationsQuery.error]);

  // Build stats from query results
  const stats = useMemo<DashboardStats | null>(() => {
    // When period is 'all', reuse allTimeQuery data
    const summaryData = period === 'all' ? allTimeQuery.data : periodQuery.data;
    if (!summaryData) return null;

    const contactsCount = contactsQuery.data ?? 0;
    const escalations = escalationsQuery.data ?? [];

    logger.debug('[Dashboard Metrics] Raw API response', {
      hasSummary: !!summaryData,
      hasLatest: !!summaryData?.latest,
      latestData: summaryData?.latest,
      conversationsPerChannel: summaryData?.latest?.conversations_per_channel,
    });

    return buildDashboardStats(summaryData, contactsCount, escalations);
  }, [period, periodQuery.data, allTimeQuery.data, contactsQuery.data, escalationsQuery.data]);

  const allTimeStats = useMemo<DashboardStats | null>(() => {
    if (!allTimeQuery.data) return null;
    const contactsCount = contactsQuery.data ?? 0;
    const escalations = escalationsQuery.data ?? [];
    return buildDashboardStats(allTimeQuery.data, contactsCount, escalations);
  }, [allTimeQuery.data, contactsQuery.data, escalationsQuery.data]);

  // isEmpty based on all-time data
  const isEmpty = useMemo(() => {
    if (!allTimeQuery.data) {
      // If allTimeQuery errored out, treat as empty
      if (allTimeQuery.error) return true;
      // Still loading
      return false;
    }
    const allTimeLatest = allTimeQuery.data.latest;
    if (!allTimeLatest) return true;

    const allTimeWhatsapp = getChannelCount(allTimeLatest.conversations_per_channel?.channels?.whatsapp);
    const allTimeWebsite = getChannelCount(allTimeLatest.conversations_per_channel?.channels?.website);
    const hasActivity = allTimeLatest.num_conversations > 0 || allTimeWhatsapp > 0 || allTimeWebsite > 0;

    logger.debug('[Dashboard Metrics] Activity check', {
      period,
      alltime_conversations: allTimeLatest.num_conversations,
      alltime_messages: allTimeLatest.num_messages,
      alltime_whatsapp: allTimeWhatsapp,
      alltime_website: allTimeWebsite,
      hasActivity,
      isEmpty: !hasActivity,
    });

    return !hasActivity;
  }, [allTimeQuery.data, allTimeQuery.error, period]);

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries(['metrics', organizationId]),
      queryClient.invalidateQueries(['metrics-alltime', organizationId]),
      queryClient.invalidateQueries(['contacts-count', organizationId]),
      queryClient.invalidateQueries(['escalations', organizationId]),
    ]);
  }, [queryClient, organizationId]);

  return {
    stats,
    allTimeStats,
    loading,
    error,
    period,
    setPeriod,
    refetch,
    isEmpty,
  };
};

export default useDashboardMetrics;
