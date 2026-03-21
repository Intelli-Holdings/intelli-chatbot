/**
 * Analytics Service Layer
 * Handles all API calls to the analytics endpoints
 *
 * IMPORTANT: This service must be used from client components with useAuth()
 * or from server components with proper token passing
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
import { fetchWithAuth } from '@/lib/auth-api-client';
import { logger } from "@/lib/logger";

// Get base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling and authentication
 * @param url - The API endpoint URL
 * @param token - Clerk authentication token
 */
async function fetchAPI<T>(url: string, token: string): Promise<T> {
  try {
    return await fetchWithAuth(url, { method: 'GET', cache: 'no-store' as RequestCache }, token);
  } catch (error) {
    logger.error(`API Error for ${url}`, { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * AnalyticsService - Main service class for analytics data
 * All methods require a Clerk authentication token
 */
export class AnalyticsService {
  /**
   * Get hourly analytics for the last N hours
   * @param organizationId - Organization ID
   * @param hours - Number of hours to fetch (default: 24)
   * @param token - Clerk authentication token
   */
  static async getHourlyAnalytics(
    organizationId: string,
    hours: number = 24,
    token: string
  ): Promise<HourlyAnalyticsResponse> {
    const url = `${API_BASE_URL}/monitoring/hourly_analytics/${organizationId}/?hours=${hours}`;
    return fetchAPI<HourlyAnalyticsResponse>(url, token);
  }

  /**
   * Get cost breakdown by model, channel, and time
   * @param organizationId - Organization ID
   * @param period - Time period ('day', 'week', 'month')
   * @param token - Clerk authentication token
   */
  static async getCostBreakdown(
    organizationId: string,
    period: 'day' | 'week' | 'month' = 'month',
    token: string
  ): Promise<CostBreakdown> {
    const url = `${API_BASE_URL}/monitoring/cost_breakdown/${organizationId}/?period=${period}`;
    return fetchAPI<CostBreakdown>(url, token);
  }

  /**
   * Get channel comparison (WhatsApp vs Website)
   * @param organizationId - Organization ID
   * @param period - Number of days to analyze (default: 30)
   * @param token - Clerk authentication token
   */
  static async getChannelComparison(
    organizationId: string,
    period: string = '30',
    token: string
  ): Promise<ChannelComparison> {
    const url = `${API_BASE_URL}/monitoring/channel_comparison/${organizationId}/?period=${period}`;
    return fetchAPI<ChannelComparison>(url, token);
  }

  /**
   * Get customer behavior insights
   * @param organizationId - Organization ID
   * @param days - Number of days to analyze (default: 30)
   * @param token - Clerk authentication token
   */
  static async getCustomerInsights(
    organizationId: string,
    days: number = 30,
    token: string
  ): Promise<CustomerInsights> {
    const url = `${API_BASE_URL}/monitoring/customer_insights/${organizationId}/?days=${days}`;
    return fetchAPI<CustomerInsights>(url, token);
  }

  /**
   * Get real-time metrics for the current hour
   * @param organizationId - Organization ID
   * @param token - Clerk authentication token
   */
  static async getRealTimeMetrics(
    organizationId: string,
    token: string
  ): Promise<RealTimeMetrics> {
    const url = `${API_BASE_URL}/monitoring/real_time_metrics/${organizationId}/`;
    return fetchAPI<RealTimeMetrics>(url, token);
  }

  /**
   * Get daily metrics for a specific date range
   * @param organizationId - Organization ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param token - Clerk authentication token
   */
  static async getDailyMetrics(
    organizationId: string,
    startDate: string | undefined,
    endDate: string | undefined,
    token: string
  ): Promise<DailyMetrics[]> {
    let url = `${API_BASE_URL}/monitoring/daily_metrics/${organizationId}/`;
    const params = new URLSearchParams();

    if (startDate) params.append('from', startDate);
    if (endDate) params.append('to', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return fetchAPI<DailyMetrics[]>(url, token);
  }

  /**
   * Get monthly metrics for trend analysis
   * @param organizationId - Organization ID
   * @param months - Number of months to fetch (default: 12)
   * @param token - Clerk authentication token
   */
  static async getMonthlyMetrics(
    organizationId: string,
    months: number = 12,
    token: string
  ): Promise<MonthlyMetrics[]> {
    const url = `${API_BASE_URL}/monitoring/monthly_metrics/${organizationId}/?months=${months}`;
    return fetchAPI<MonthlyMetrics[]>(url, token);
  }

  /**
   * Get metrics summary (existing endpoint)
   * @param organizationId - Organization ID
   * @param period - Period in days or 'all'
   * @param token - Clerk authentication token
   */
  static async getMetricsSummary(
    organizationId: string,
    period: string = '30',
    token: string
  ) {
    const url = `${API_BASE_URL}/monitoring/get_metrics_summary_by_organization/${organizationId}/?period=${period}`;
    return fetchAPI(url, token);
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
