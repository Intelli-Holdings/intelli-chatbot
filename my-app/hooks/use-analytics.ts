/**
 * Custom React Hooks for Analytics
 * Manages state and data fetching for analytics components
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsService } from '@/services/analytics';
import type {
  HourlyAnalyticsResponse,
  CostBreakdown,
  ChannelComparison,
  CustomerInsights,
  RealTimeMetrics,
  DailyMetrics,
  MonthlyMetrics
} from '@/types/analytics';

// ============================================================================
// Hook Return Type Interface
// ============================================================================

interface UseDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Hourly Analytics Hook
// ============================================================================

/**
 * Hook for fetching hourly analytics data
 * @param organizationId - Organization ID
 * @param hours - Number of hours to fetch
 * @param autoRefresh - Enable auto-refresh (default: false)
 * @param refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 */
export function useHourlyAnalytics(
  organizationId: string | null,
  hours: number = 24,
  autoRefresh: boolean = false,
  refreshInterval: number = 5 * 60 * 1000
): UseDataReturn<HourlyAnalyticsResponse> {
  const [data, setData] = useState<HourlyAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getHourlyAnalytics(organizationId, hours);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hourly analytics');
      console.error('Error fetching hourly analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, hours]);

  useEffect(() => {
    fetchData();

    // Setup auto-refresh if enabled
    if (autoRefresh && organizationId) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval, organizationId]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Cost Breakdown Hook
// ============================================================================

/**
 * Hook for fetching cost breakdown data
 * @param organizationId - Organization ID
 * @param period - Time period ('day', 'week', 'month')
 */
export function useCostBreakdown(
  organizationId: string | null,
  period: 'day' | 'week' | 'month' = 'month'
): UseDataReturn<CostBreakdown> {
  const [data, setData] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getCostBreakdown(organizationId, period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost breakdown');
      console.error('Error fetching cost breakdown:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Channel Comparison Hook
// ============================================================================

/**
 * Hook for fetching channel comparison data
 * @param organizationId - Organization ID
 * @param period - Number of days to analyze
 */
export function useChannelComparison(
  organizationId: string | null,
  period: string = '30'
): UseDataReturn<ChannelComparison> {
  const [data, setData] = useState<ChannelComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getChannelComparison(organizationId, period);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channel comparison');
      console.error('Error fetching channel comparison:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Customer Insights Hook
// ============================================================================

/**
 * Hook for fetching customer insights data
 * @param organizationId - Organization ID
 * @param days - Number of days to analyze
 */
export function useCustomerInsights(
  organizationId: string | null,
  days: number = 30
): UseDataReturn<CustomerInsights> {
  const [data, setData] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getCustomerInsights(organizationId, days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer insights');
      console.error('Error fetching customer insights:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Real-Time Metrics Hook
// ============================================================================

/**
 * Hook for fetching real-time metrics
 * @param organizationId - Organization ID
 * @param autoRefresh - Enable auto-refresh (default: true)
 * @param refreshInterval - Refresh interval in milliseconds (default: 1 minute)
 */
export function useRealTimeMetrics(
  organizationId: string | null,
  autoRefresh: boolean = true,
  refreshInterval: number = 60 * 1000
): UseDataReturn<RealTimeMetrics> {
  const [data, setData] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await AnalyticsService.getRealTimeMetrics(organizationId);
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time metrics');
      console.error('Error fetching real-time metrics:', err);
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();

    // Setup auto-refresh if enabled
    if (autoRefresh && organizationId) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval, organizationId]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Daily Metrics Hook
// ============================================================================

/**
 * Hook for fetching daily metrics
 * @param organizationId - Organization ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 */
export function useDailyMetrics(
  organizationId: string | null,
  startDate?: string,
  endDate?: string
): UseDataReturn<DailyMetrics[]> {
  const [data, setData] = useState<DailyMetrics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getDailyMetrics(organizationId, startDate, endDate);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily metrics');
      console.error('Error fetching daily metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Monthly Metrics Hook
// ============================================================================

/**
 * Hook for fetching monthly metrics
 * @param organizationId - Organization ID
 * @param months - Number of months to fetch
 */
export function useMonthlyMetrics(
  organizationId: string | null,
  months: number = 12
): UseDataReturn<MonthlyMetrics[]> {
  const [data, setData] = useState<MonthlyMetrics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getMonthlyMetrics(organizationId, months);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monthly metrics');
      console.error('Error fetching monthly metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, months]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Combined Analytics Hook (for comprehensive dashboard)
// ============================================================================

interface CombinedAnalyticsData {
  hourly: HourlyAnalyticsResponse | null;
  cost: CostBreakdown | null;
  channels: ChannelComparison | null;
  insights: CustomerInsights | null;
  realTime: RealTimeMetrics | null;
}

/**
 * Hook that fetches all analytics data at once
 * Useful for comprehensive dashboard views
 * @param organizationId - Organization ID
 */
export function useCombinedAnalytics(
  organizationId: string | null
): UseDataReturn<CombinedAnalyticsData> {
  const [data, setData] = useState<CombinedAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [hourly, cost, channels, insights, realTime] = await Promise.all([
        AnalyticsService.getHourlyAnalytics(organizationId, 24),
        AnalyticsService.getCostBreakdown(organizationId, 'month'),
        AnalyticsService.getChannelComparison(organizationId, '30'),
        AnalyticsService.getCustomerInsights(organizationId, 30),
        AnalyticsService.getRealTimeMetrics(organizationId)
      ]);

      setData({ hourly, cost, channels, insights, realTime });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      console.error('Error fetching combined analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
