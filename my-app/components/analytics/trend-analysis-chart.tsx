'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useHourlyAnalytics } from '@/hooks/use-analytics';
import { formatCost, formatNumber } from '@/services/analytics';
import type { TimeGranularity } from '@/types/analytics';

interface TrendAnalysisChartProps {
  organizationId: string | null;
  granularity?: TimeGranularity;
}

export function TrendAnalysisChart({
  organizationId,
  granularity = 'hourly',
}: TrendAnalysisChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'messages' | 'tokens' | 'cost'>('messages');
  const [hours, setHours] = useState(24);

  const { data, loading, error, refetch } = useHourlyAnalytics(organizationId, hours, true, 5 * 60 * 1000);

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
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
        <h3 className="text-lg font-semibold text-red-700">Trend Analysis</h3>
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

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-gray-500">
          <TrendingUp className="h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">No trend data available yet</p>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.data.map((metric) => {
    const date = new Date(metric.timestamp);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullTime: date.toLocaleString(),
      messages: metric.total_messages,
      whatsapp: metric.whatsapp_messages,
      website: metric.website_messages,
      tokens: metric.total_tokens,
      cost: Number(metric.total_cost),
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullTime}</p>
          <div className="mt-2 space-y-1">
            {selectedMetric === 'messages' && (
              <>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium">{formatNumber(data.messages)}</span>
                </p>
                <p className="text-sm text-green-600">
                  WhatsApp: <span className="font-medium">{formatNumber(data.whatsapp)}</span>
                </p>
                <p className="text-sm text-blue-600">
                  Website: <span className="font-medium">{formatNumber(data.website)}</span>
                </p>
              </>
            )}
            {selectedMetric === 'tokens' && (
              <p className="text-sm text-gray-600">
                Tokens: <span className="font-medium">{formatNumber(data.tokens)}</span>
              </p>
            )}
            {selectedMetric === 'cost' && (
              <p className="text-sm text-gray-600">
                Cost: <span className="font-medium">{formatCost(data.cost)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate summary statistics
  const totalMessages = chartData.reduce((sum, d) => sum + d.messages, 0);
  const totalTokens = chartData.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = chartData.reduce((sum, d) => sum + d.cost, 0);
  const avgMessagesPerHour = totalMessages / chartData.length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">
            Last {hours} hours • Updates every 5 minutes
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

      {/* Controls */}
      <div className="mt-4 flex flex-wrap gap-4">
        {/* Metric Selector */}
        <div className="flex gap-2">
          <span className="self-center text-sm font-medium text-gray-700">Metric:</span>
          {(['messages', 'tokens', 'cost'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          <span className="self-center text-sm font-medium text-gray-700">Hours:</span>
          {[12, 24, 48, 72].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) =>
                selectedMetric === 'cost' ? `$${value}` : formatNumber(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {selectedMetric === 'messages' && (
              <>
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Total Messages"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="whatsapp"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="WhatsApp"
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="website"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Website"
                  dot={false}
                  strokeDasharray="5 5"
                />
              </>
            )}

            {selectedMetric === 'tokens' && (
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Tokens"
                dot={false}
              />
            )}

            {selectedMetric === 'cost' && (
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#EF4444"
                strokeWidth={3}
                name="Cost ($)"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-gray-600">Total Messages</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{formatNumber(totalMessages)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">Avg/Hour</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatNumber(Math.round(avgMessagesPerHour))}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">Total Tokens</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{formatNumber(totalTokens)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">Total Cost</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{formatCost(totalCost)}</p>
        </div>
      </div>
    </div>
  );
}

export default TrendAnalysisChart;
