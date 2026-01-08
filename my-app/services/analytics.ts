/**
 * Analytics Service Layer
 * Handles all API calls to the analytics endpoints
 */

import {
  HourlyAnalyticsResponse,
  CostBreakdown,
  ChannelComparison,
  CustomerInsights,
  RealTimeMetrics,
  DailyMetrics,
  MonthlyMetrics,
  ApiError,
  TimePeriod
} from '@/types/analytics';

// Get base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
}

/**
 * AnalyticsService - Main service class for analytics data
 */
export class AnalyticsService {
  /**
   * Get hourly analytics for the last N hours
   * @param organizationId - Organization ID
   * @param hours - Number of hours to fetch (default: 24)
   */
  static async getHourlyAnalytics(
    organizationId: string,
    hours: number = 24
  ): Promise<HourlyAnalyticsResponse> {
    const url = `${API_BASE_URL}/monitoring/hourly_analytics/${organizationId}/?hours=${hours}`;
    return fetchAPI<HourlyAnalyticsResponse>(url);
  }

  /**
   * Get cost breakdown by model, channel, and time
   * @param organizationId - Organization ID
   * @param period - Time period ('day', 'week', 'month')
   */
  static async getCostBreakdown(
    organizationId: string,
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<CostBreakdown> {
    const url = `${API_BASE_URL}/monitoring/cost_breakdown/${organizationId}/?period=${period}`;
    return fetchAPI<CostBreakdown>(url);
  }

  /**
   * Get channel comparison (WhatsApp vs Website)
   * @param organizationId - Organization ID
   * @param period - Number of days to analyze (default: 30)
   */
  static async getChannelComparison(
    organizationId: string,
    period: string = '30'
  ): Promise<ChannelComparison> {
    const url = `${API_BASE_URL}/monitoring/channel_comparison/${organizationId}/?period=${period}`;
    return fetchAPI<ChannelComparison>(url);
  }

  /**
   * Get customer behavior insights
   * @param organizationId - Organization ID
   * @param days - Number of days to analyze (default: 30)
   */
  static async getCustomerInsights(
    organizationId: string,
    days: number = 30
  ): Promise<CustomerInsights> {
    const url = `${API_BASE_URL}/monitoring/customer_insights/${organizationId}/?days=${days}`;
    return fetchAPI<CustomerInsights>(url);
  }

  /**
   * Get real-time metrics for the current hour
   * @param organizationId - Organization ID
   */
  static async getRealTimeMetrics(
    organizationId: string
  ): Promise<RealTimeMetrics> {
    const url = `${API_BASE_URL}/monitoring/real_time_metrics/${organizationId}/`;
    return fetchAPI<RealTimeMetrics>(url);
  }

  /**
   * Get daily metrics for a specific date range
   * @param organizationId - Organization ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  static async getDailyMetrics(
    organizationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DailyMetrics[]> {
    let url = `${API_BASE_URL}/monitoring/daily_metrics/${organizationId}/`;
    const params = new URLSearchParams();

    if (startDate) params.append('from', startDate);
    if (endDate) params.append('to', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return fetchAPI<DailyMetrics[]>(url);
  }

  /**
   * Get monthly metrics for trend analysis
   * @param organizationId - Organization ID
   * @param months - Number of months to fetch (default: 12)
   */
  static async getMonthlyMetrics(
    organizationId: string,
    months: number = 12
  ): Promise<MonthlyMetrics[]> {
    const url = `${API_BASE_URL}/monitoring/monthly_metrics/${organizationId}/?months=${months}`;
    return fetchAPI<MonthlyMetrics[]>(url);
  }

  /**
   * Get metrics summary (existing endpoint)
   * @param organizationId - Organization ID
   * @param period - Period in days or 'all'
   */
  static async getMetricsSummary(
    organizationId: string,
    period: string = '30'
  ) {
    const url = `${API_BASE_URL}/monitoring/get_metrics_summary_by_organization/${organizationId}/?period=${period}`;
    return fetchAPI(url);
  }
}

/**
 * Helper functions for data transformation
 */

/**
 * Format cost for display
 * @param cost - Cost value
 * @param currency - Currency symbol (default: $)
 */
export function formatCost(cost: number, currency: string = '$'): string {
  return `${currency}${cost.toFixed(4)}`;
}

/**
 * Format large numbers (tokens, messages)
 * @param num - Number to format
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toString();
}

/**
 * Calculate percentage change
 * @param current - Current value
 * @param previous - Previous value
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date for API calls (YYYY-MM-DD)
 * @param date - Date object
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for period
 * @param period - Time period
 */
export function getDateRangeForPeriod(period: TimePeriod): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setDate(start.getDate() - 30);
      break;
    case '7':
      start.setDate(start.getDate() - 7);
      break;
    case '30':
      start.setDate(start.getDate() - 30);
      break;
    case '90':
      start.setDate(start.getDate() - 90);
      break;
  }

  return {
    startDate: formatDateForAPI(start),
    endDate: formatDateForAPI(end)
  };
}

/**
 * Extract model name for display (remove provider prefix)
 * @param modelName - Full model name from API
 */
export function formatModelName(modelName: string): string {
  // Remove common prefixes like "gpt-", "claude-", etc.
  return modelName
    .replace(/^(gpt-|claude-|llama-)/i, '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default AnalyticsService;
