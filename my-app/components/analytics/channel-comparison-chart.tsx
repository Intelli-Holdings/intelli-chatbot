'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Users, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { useChannelComparison } from '@/hooks/use-analytics';
import { formatCost, formatNumber } from '@/services/analytics';

interface ChannelComparisonChartProps {
  organizationId: string | null;
  period?: string;
}

export function ChannelComparisonChart({
  organizationId,
  period = '30',
}: ChannelComparisonChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const { data, loading, error, refetch } = useChannelComparison(organizationId, selectedPeriod);

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Channel Comparison</h3>
        <p className="mt-2 text-sm text-gray-500">No organization selected</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-700">Channel Comparison</h3>
        <p className="mt-2 text-sm text-red-600">Error: {error}</p>
        <button
          onClick={refetch}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Transform data for bar chart
  const chartData = [
    {
      metric: 'Messages',
      WhatsApp: data.whatsapp.messages,
      Website: data.website.messages,
    },
    {
      metric: 'Conversations',
      WhatsApp: data.whatsapp.conversations,
      Website: data.website.conversations,
    },
    {
      metric: 'Customers',
      WhatsApp: data.whatsapp.unique_customers,
      Website: data.website.unique_customers,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.metric}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: <span className="font-medium">{formatNumber(entry.value)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate totals and percentages
  const totalMessages = data.whatsapp.messages + data.website.messages;
  const totalConversations = data.whatsapp.conversations + data.website.conversations;
  const totalCustomers = data.whatsapp.unique_customers + data.website.unique_customers;
  const totalCost = data.whatsapp.cost + data.website.cost;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Channel Comparison</h3>
          <p className="mt-1 text-sm text-gray-500">WhatsApp vs Website Performance</p>
        </div>
        <button
          onClick={refetch}
          className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Period Selector */}
      <div className="mt-4 flex gap-2">
        {['7', '30', '90'].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              selectedPeriod === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p} days
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="WhatsApp" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Website" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
        {/* WhatsApp */}
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-white p-4 border border-green-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">WhatsApp</h4>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-600">Messages</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.whatsapp.messages)}
              </p>
              <p className="text-xs text-gray-500">
                {((data.whatsapp.messages / totalMessages) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Conversations</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.whatsapp.conversations)}
              </p>
              <p className="text-xs text-gray-500">
                Avg {data.whatsapp.avg_messages_per_conversation.toFixed(1)} msgs/conv
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Cost</p>
              <p className="text-lg font-bold text-gray-900">{formatCost(data.whatsapp.cost)}</p>
              <p className="text-xs text-gray-500">
                {formatCost(data.whatsapp.cost / data.whatsapp.messages)} per message
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Unique Customers</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.whatsapp.unique_customers)}
              </p>
            </div>
          </div>
        </div>

        {/* Website */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white p-4 border border-blue-200">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Website</h4>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-600">Messages</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.website.messages)}
              </p>
              <p className="text-xs text-gray-500">
                {((data.website.messages / totalMessages) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Conversations</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.website.conversations)}
              </p>
              <p className="text-xs text-gray-500">
                Avg {data.website.avg_messages_per_conversation.toFixed(1)} msgs/conv
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Cost</p>
              <p className="text-lg font-bold text-gray-900">{formatCost(data.website.cost)}</p>
              <p className="text-xs text-gray-500">
                {formatCost(data.website.cost / data.website.messages)} per message
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Unique Visitors</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(data.website.unique_customers)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-700">Combined Totals</h4>
        <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-600">Total Messages</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(totalMessages)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Conversations</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(totalConversations)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Customers</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(totalCustomers)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Cost</p>
            <p className="text-lg font-bold text-gray-900">{formatCost(totalCost)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelComparisonChart;
