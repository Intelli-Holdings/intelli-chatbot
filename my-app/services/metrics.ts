/**
 * Metrics Service - Handles all metrics-related API calls
 * Uses Next.js API routes that proxy to Django backend
 */

export interface MetricData {
  id: number;
  organization: number;
  free_token: number;
  used_token: number;
  payed_token: number;
  total_token: number;
  remaining_token: number;
  num_conversations: number;
  num_messages: number;
  num_escalations: number;
  num_pending: number;
  num_assigned: number;
  num_resolved: number;
  conversations_per_channel: {
    channels: {
      whatsapp?: number;
      website?: number;
      email?: number;
      instagram?: number;
      messenger?: number;
    };
    notifications?: {
      escalations?: number;
      pending?: number;
      assigned?: number;
      resolved?: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface MetricsSummary {
  summary: {
    total_conversations: number;
    total_messages: number;
    total_pending: number;
    total_assigned: number;
    total_resolved: number;
    total_tokens_used: number;
    avg_tokens_remaining: number;
    record_count: number;
  };
  latest: MetricData;
  timeline: MetricData[];
  organization: string;
  from?: string;
  to?: string;
}

export interface DashboardStats {
  // Contact metrics
  totalContacts: number;
  needFollowUp: number;
  converted: number;
  inboundLeads: number;

  // Conversation metrics
  totalConversations: number;
  totalMessages: number;
  activeConversations: number;
  avgResponseTime: string;

  // Token metrics
  tokensUsed: number;
  tokensLimit: number;
  tokenUsagePercent: number;
  estimatedCost: number;

  // Escalation metrics
  totalEscalations: number;
  pendingEscalations: number;
  assignedTickets: number;
  resolvedTickets: number;

  // Channel breakdown
  channelStats: {
    whatsapp: number;
    website: number;
    email: number;
    instagram: number;
    messenger: number;
  };

  // Recent activity
  recentEscalations: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    timestamp: string;
  }>;

  // Timeline data for charts
  conversationTrend: Array<{
    date: string;
    count: number;
  }>;

  messageTrend: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Fetch metrics for an organization with optional date range
 */
export async function getMetricsByOrganization(
  organizationId: string,
  params?: {
    from?: string;  // YYYY-MM-DD
    to?: string;    // YYYY-MM-DD
    period?: string; // '7', '30', 'all'
  }
): Promise<MetricData[]> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.period) queryParams.append('period', params.period);

  const url = `/api/monitoring/get_metrics_by_organization/${organizationId}?${queryParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
}

/**
 * Fetch metrics summary with aggregated data
 */
export async function getMetricsSummary(
  organizationId: string,
  params?: {
    from?: string;
    to?: string;
    period?: string;
  }
): Promise<MetricsSummary> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.period) queryParams.append('period', params.period);

  const url = `/api/monitoring/get_metrics_summary_by_organization/${organizationId}?${queryParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics summary: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Trigger a new metrics snapshot
 */
export async function produceMetricsSnapshot(organizationId: string): Promise<MetricData> {
  const url = `/api/monitoring/produce_metrics_snapshot`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organization_id: organizationId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to produce metrics snapshot: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for common periods
 */
export function getDateRangeForPeriod(period: 'today' | 'week' | 'month' | 'all'): {
  from?: string;
  to?: string;
  period?: string;
} {
  const today = new Date();
  const todayStr = formatDateForAPI(today);

  switch (period) {
    case 'today':
      return { from: todayStr, to: todayStr };

    case 'week':
      return { period: '7' };

    case 'month':
      return { period: '30' };

    case 'all':
      return { period: 'all' };

    default:
      return { period: '7' };
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format number for display (e.g., 1234 -> 1.2K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
