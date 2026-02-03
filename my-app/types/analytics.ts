/**
 * TypeScript type definitions for Analytics System
 * Aligned with backend API response structures
 */

// ============================================================================
// Hourly Metrics Types
// ============================================================================

export interface HourlyMetrics {
  id: number;
  organization: number;
  organization_name: string;
  timestamp: string;
  whatsapp_messages: number;
  website_messages: number;
  total_messages: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  model_breakdown: Record<string, ModelUsage>;
  new_conversations: number;
  active_conversations: number;
  created_at: string;
}

export interface ModelUsage {
  tokens: number;
  cost: number;
  message_count?: number;
}

export interface HourlyAnalyticsResponse {
  organization: string;
  hours: number;
  start_time: string;
  end_time: string;
  data: HourlyMetrics[];
}

// ============================================================================
// Cost Breakdown Types
// ============================================================================

export interface ModelBreakdown {
  tokens: number;
  cost: number;
  message_count: number;
  percentage: number;
}

export interface CostBreakdown {
  organization: string;
  period: 'day' | 'week' | 'month';
  start_time: string;
  end_time: string;
  by_model: Record<string, ModelBreakdown>;
  by_channel: {
    whatsapp: number;
    website: number;
  };
  total_cost: number;
  total_tokens: number;
}

// ============================================================================
// Channel Comparison Types
// ============================================================================

export interface ChannelMetrics {
  messages: number;
  conversations: number;
  cost: number;
  tokens: number;
  unique_customers: number;
  avg_messages_per_conversation: number;
}

export interface ChannelComparison {
  organization: string;
  period_days: number;
  start_time: string;
  end_time: string;
  whatsapp: ChannelMetrics;
  website: ChannelMetrics;
}

// ============================================================================
// Customer Insights Types
// ============================================================================

export interface PeakHour {
  hour: number;
  message_count: number;
}

export interface ActiveCustomer {
  customer_number: string;
  message_count: number;
}

export interface ActiveVisitor {
  visitor_id: string;
  message_count: number;
}

export interface CustomerInsights {
  organization: string;
  period_days: number;
  start_time: string;
  end_time: string;
  avg_messages_per_session: number;
  peak_hours: PeakHour[];
  most_active_whatsapp_customers: ActiveCustomer[];
  most_active_website_visitors: ActiveVisitor[];
  total_unique_customers: number;
}

// ============================================================================
// Real-Time Metrics Types
// ============================================================================

export interface RealTimeMetricsData {
  whatsapp_messages: number;
  website_messages: number;
  total_messages: number;
  total_tokens: number;
  total_cost: number;
  active_conversations: number;
}

export interface RealTimeMetrics {
  organization: string;
  current_hour: string;
  data: RealTimeMetricsData | HourlyMetrics;
  is_aggregated: boolean;
}

// ============================================================================
// Daily & Monthly Metrics Types
// ============================================================================

export interface DailyMetrics {
  id: number;
  organization: number;
  organization_name: string;
  date: string;
  whatsapp_messages: number;
  whatsapp_conversations: number;
  whatsapp_cost: number;
  website_messages: number;
  website_conversations: number;
  website_cost: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_input_cost: number;
  total_output_cost: number;
  total_cost: number;
  model_usage: Record<string, ModelUsage>;
  unique_customers: number;
  avg_messages_per_conversation: number;
  avg_response_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyMetrics {
  id: number;
  organization: number;
  organization_name: string;
  year: number;
  month: number;
  total_messages: number;
  total_conversations: number;
  total_customers: number;
  total_tokens: number;
  total_cost: number;
  channel_breakdown: {
    whatsapp: {
      messages: number;
      cost: number;
      tokens: number;
    };
    website: {
      messages: number;
      cost: number;
      tokens: number;
    };
  };
  mom_growth_messages: number;
  mom_growth_cost: number;
  created_at: string;
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface TimeSeriesDataPoint {
  timestamp: string;
  messages: number;
  tokens: number;
  cost: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export type TimeGranularity = 'hourly' | 'daily' | 'monthly';
export type TimePeriod = 'day' | 'week' | 'month' | '7' | '30' | '90';

export interface AnalyticsFilters {
  granularity: TimeGranularity;
  period: TimePeriod;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
