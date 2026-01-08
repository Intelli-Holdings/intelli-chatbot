'use client';

import React from 'react';
import { MessageSquare, Coins, Users, Activity, RefreshCw } from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/use-analytics';
import { formatCost, formatNumber } from '@/services/analytics';

interface RealTimeMetricsCardProps {
  organizationId: string | null;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full ${iconBg} p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export function RealTimeMetricsCard({ organizationId }: RealTimeMetricsCardProps) {
  const { data, loading, error, refetch } = useRealTimeMetrics(
    organizationId,
    true, // auto-refresh enabled
    60 * 1000 // refresh every minute
  );

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
        No organization selected
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading real-time metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Error loading real-time metrics: {error}</p>
        <button
          onClick={refetch}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const metrics = 'whatsapp_messages' in data.data ? data.data : {
    whatsapp_messages: 0,
    website_messages: 0,
    total_messages: 0,
    total_tokens: 0,
    total_cost: 0,
    active_conversations: 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Metrics</h2>
          <p className="mt-1 text-sm text-gray-500">
            Current hour • Updates every minute
            {data.is_aggregated && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                Aggregated
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refetch}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="inline h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Messages This Hour"
          value={formatNumber(metrics.total_messages)}
          icon={MessageSquare}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        <MetricCard
          title="Cost This Hour"
          value={formatCost(Number(metrics.total_cost))}
          icon={Coins}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />

        <MetricCard
          title="Active Conversations"
          value={formatNumber(metrics.active_conversations)}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />

        <MetricCard
          title="Tokens This Hour"
          value={formatNumber(metrics.total_tokens)}
          icon={Activity}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Channel Breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4">
          <p className="text-sm font-medium text-gray-600">WhatsApp</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatNumber(metrics.whatsapp_messages)}
          </p>
          <p className="mt-1 text-xs text-gray-500">messages</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
          <p className="text-sm font-medium text-gray-600">Website</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {formatNumber(metrics.website_messages)}
          </p>
          <p className="mt-1 text-xs text-gray-500">messages</p>
        </div>
      </div>
    </div>
  );
}

export default RealTimeMetricsCard;
