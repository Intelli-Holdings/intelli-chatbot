'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { useCostBreakdown } from '@/hooks/use-analytics';
import { formatCost, formatNumber } from '@/services/analytics';

interface CostBreakdownChartProps {
  organizationId: string | null;
  period?: 'day' | 'week' | 'month';
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export function CostBreakdownChart({ organizationId, period = 'month' }: CostBreakdownChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>(period);
  const { data, loading, error, refetch } = useCostBreakdown(organizationId, selectedPeriod);

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
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
        <h3 className="text-lg font-semibold text-red-700">Cost Breakdown</h3>
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

  // Transform data for pie chart (using index-based labels instead of model names)
  const chartData = Object.entries(data.by_model).map(([, stats], index) => ({
    name: `Usage ${index + 1}`,
    value: stats.cost,
    percentage: stats.percentage,
    tokens: stats.tokens,
    messages: stats.message_count,
  }));

  // Custom label for pie chart - only show percentage
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip - hide model names
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Cost: <span className="font-medium">{formatCost(data.value)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Percentage: <span className="font-medium">{data.percentage.toFixed(2)}%</span>
            </p>
            <p className="text-sm text-gray-600">
              Tokens: <span className="font-medium">{formatNumber(data.tokens)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Messages: <span className="font-medium">{formatNumber(data.messages)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
          <p className="mt-1 text-sm text-gray-500">
            Total: {formatCost(data.total_cost)} • {formatNumber(data.total_tokens)} tokens
          </p>
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
        {(['day', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              selectedPeriod === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Pie Chart */}
      {chartData.length > 0 ? (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">No cost data available for this period</p>
        </div>
      )}

      {/* Channel Breakdown */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700">Cost by Channel</h4>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs font-medium text-gray-600">WhatsApp</p>
            <p className="mt-1 text-xl font-bold text-green-700">
              {formatCost(data.by_channel.whatsapp)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {((data.by_channel.whatsapp / data.total_cost) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-medium text-gray-600">Website</p>
            <p className="mt-1 text-xl font-bold text-blue-700">
              {formatCost(data.by_channel.website)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {((data.by_channel.website / data.total_cost) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
        <div>
          <p className="text-xs font-medium text-gray-600">Average Cost per Message</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatCost(
              data.total_cost /
                Object.values(data.by_model).reduce((sum, m) => sum + m.message_count, 0)
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">Average Cost per 1K Tokens</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatCost((data.total_cost / data.total_tokens) * 1000)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CostBreakdownChart;
