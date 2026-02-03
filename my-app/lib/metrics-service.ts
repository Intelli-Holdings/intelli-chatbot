/**
 * Metrics Service - Handles all metrics data fetching and processing
 */

export interface ChannelEscalations {
  total: number
  pending: number
  assigned: number
  resolved: number
  escalations: number
  average_duration: number
}

export interface ChannelMetrics {
  tokens_used: number
  number_of_app: number
  number_of_messages: number
  number_of_escalations: ChannelEscalations
  number_of_conversations: number
}

export interface NotificationMetrics {
  total: number
  pending: number
  assigned: number
  resolved: number
  escalations: number
  average_duration: number
}

export interface ConversationsPerChannel {
  channels: {
    website?: ChannelMetrics
    whatsapp?: ChannelMetrics
  }
  notifications: NotificationMetrics
}

export interface MetricsSnapshot {
  id: number
  free_token: number
  used_token: number
  payed_token: number
  total_token: number
  remaining_token: number
  num_conversations: number
  num_messages: number
  num_escalations: number
  num_pending: number
  num_assigned: number
  num_resolved: number
  conversations_per_channel: ConversationsPerChannel
  created_at: string
  updated_at: string
  organization: string
}

export interface MetricsSummary {
  total_conversations: number
  total_messages: number
  total_pending: number
  total_assigned: number
  total_resolved: number
  total_tokens_used: number
  avg_tokens_remaining: number
  record_count: number
}

export interface MetricsResponse {
  summary: MetricsSummary
  latest: MetricsSnapshot
  timeline: MetricsSnapshot[]
  organization: string
  from: string
  to: string
}

export interface MetricsQueryParams {
  from?: string
  to?: string
  period?: string | number
}

/**
 * Produce a metrics snapshot for an organization
 */
export async function produceMetricsSnapshot(organizationId: string): Promise<any> {
  const response = await fetch("/api/monitoring/produce_metrics_snapshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ organization_id: organizationId }),
  })

  if (!response.ok) {
    throw new Error(`Failed to produce metrics snapshot: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get metrics snapshots for an organization with optional date range and period filters
 */
export async function getMetricsByOrganization(
  organizationId: string,
  params?: MetricsQueryParams,
): Promise<MetricsSnapshot[]> {
  const queryParams = new URLSearchParams()

  if (params?.from) queryParams.append("from", params.from)
  if (params?.to) queryParams.append("to", params.to)
  if (params?.period) queryParams.append("period", params.period.toString())

  const response = await fetch(`/api/monitoring/get_metrics_by_organization/${organizationId}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch metrics: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get aggregated metrics summary for an organization
 */
export async function getMetricsSummaryByOrganization(
  organizationId: string,
  params?: MetricsQueryParams,
): Promise<MetricsResponse | null> {
  const queryParams = new URLSearchParams()

  if (params?.from) queryParams.append("from", params.from)
  if (params?.to) queryParams.append("to", params.to)
  if (params?.period) queryParams.append("period", params.period.toString())

  const response = await fetch(`/api/monitoring/get_metrics_summary_by_organization/${organizationId}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch metrics summary: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? "+" : ""
  return `${sign}${percentage.toFixed(1)}%`
}
