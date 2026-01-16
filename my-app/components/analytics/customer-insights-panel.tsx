'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useCustomerInsights } from '@/hooks/use-analytics';
import { formatNumber } from '@/services/analytics';

interface CustomerInsightsPanelProps {
  organizationId: string | null;
  days?: number;
}

export function CustomerInsightsPanel({
  organizationId,
  days = 30,
}: CustomerInsightsPanelProps) {
  const [selectedDays, setSelectedDays] = useState(days);
  const { data, loading, error, refetch } = useCustomerInsights(organizationId, selectedDays);

  if (!organizationId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
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
        <h3 className="text-lg font-semibold text-red-700">Customer Insights</h3>
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

  // Transform peak hours data for chart
  const peakHoursData = data.peak_hours.map((ph) => ({
    hour: `${ph.hour}:00`,
    hourNum: ph.hour,
    messages: ph.message_count,
  }));

  // Custom tooltip for peak hours
  const PeakHoursTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.hour}</p>
          <p className="mt-1 text-sm text-gray-600">
            Messages: <span className="font-medium">{formatNumber(data.messages)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Find peak hour
  const peakHour = peakHoursData.reduce((max, ph) =>
    ph.messages > max.messages ? ph : max
  , peakHoursData[0] || { hour: '0:00', messages: 0 });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
          <p className="mt-1 text-sm text-gray-500">
            Behavior patterns and activity trends
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

      {/* Days Selector */}
      <div className="mt-4 flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDays(d)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              selectedDays === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Total Customers</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatNumber(data.total_unique_customers)}
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">Avg Messages/Session</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.avg_messages_per_session.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-white border border-orange-200 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-medium text-gray-700">Peak Hour</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{peakHour.hour}</p>
          <p className="mt-1 text-xs text-gray-500">
            {formatNumber(peakHour.messages)} messages
          </p>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700">Peak Activity Hours</h4>
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="hour"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<PeakHoursTooltip />} />
              <Bar dataKey="messages" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Active Customers */}
      <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2">
        {/* WhatsApp Customers */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700">
            Most Active WhatsApp Customers
          </h4>
          <div className="mt-3 space-y-2">
            {data.most_active_whatsapp_customers.length > 0 ? (
              data.most_active_whatsapp_customers.slice(0, 5).map((customer, index) => (
                <div
                  key={customer.customer_number}
                  className="flex items-center justify-between rounded-lg bg-green-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="font-mono text-sm text-gray-700">
                      {customer.customer_number}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    {formatNumber(customer.message_count)} msgs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No WhatsApp customers yet</p>
            )}
          </div>
        </div>

        {/* Website Visitors */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700">
            Most Active Website Visitors
          </h4>
          <div className="mt-3 space-y-2">
            {data.most_active_website_visitors.length > 0 ? (
              data.most_active_website_visitors.slice(0, 5).map((visitor, index) => (
                <div
                  key={visitor.visitor_id}
                  className="flex items-center justify-between rounded-lg bg-blue-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="font-mono text-sm text-gray-700">
                      {visitor.visitor_id.substring(0, 12)}...
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatNumber(visitor.message_count)} msgs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No website visitors yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerInsightsPanel;
