"use client"

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import { useDashboardMetrics, type TimePeriod } from "@/hooks/use-dashboard-metrics";
import { DashboardEmptyState } from "./empty-state";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WhatsappOnboarding from '@/components/WhatsappOnboarding';
import UnifiedWidgets from '@/components/UnifiedWidgets';
import Channels from './channels';

// Recharts imports
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PeriodButtonProps {
  label: string;
  period: TimePeriod;
  currentPeriod: TimePeriod;
  onClick: (period: TimePeriod) => void;
}

const PeriodButton: React.FC<PeriodButtonProps> = ({ label, period, currentPeriod, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(period)}
    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
      currentPeriod === period
        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-[#007fff]',
      border: 'border-[#dbe8ff]',
      cardBg: 'bg-[#f5f9ff]'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      cardBg: 'bg-green-50'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-[#b42318]',
      border: 'border-[#f0d6d6]',
      cardBg: 'bg-[#fff5f5]'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      cardBg: 'bg-purple-50'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      cardBg: 'bg-orange-50'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.cardBg} p-3`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-semibold ${colors.text}`}>{value}</p>
          <p className="text-xs text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span className={`inline-flex items-center text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {icon}
        </div>
      </div>
    </div>
  );
};

export const DynamicDashboard: React.FC = () => {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const {
    stats,
    loading,
    error,
    period,
    setPeriod,
    refetch,
    isEmpty
  } = useDashboardMetrics(organizationId || null);

  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);

  // Show empty state for new users
  if (isEmpty && !loading) {
    return (
      <>
        <DashboardEmptyState
          userName={organization?.name || "there"}
          onWhatsAppSetup={() => setWhatsappDialogOpen(true)}
          onWebsiteSetup={() => setWebsiteDialogOpen(true)}
        />

        {/* Dialogs */}
        <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
          <DialogContent className="max-w-4xl">
            <WhatsappOnboarding />
          </DialogContent>
        </Dialog>

        <Dialog open={websiteDialogOpen} onOpenChange={setWebsiteDialogOpen}>
          <DialogContent className="max-w-4xl">
            <UnifiedWidgets />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Loading skeleton
  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              Track your customer engagement and performance metrics
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-10 rounded-full px-4 text-sm font-semibold"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Metrics Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Insights</h2>
            <p className="text-sm text-gray-500">
              Review your key metrics for the selected period
            </p>
          </div>

          {/* Period Filter */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <PeriodButton label="Today" period="today" currentPeriod={period} onClick={setPeriod} />
            <PeriodButton label="This Week" period="week" currentPeriod={period} onClick={setPeriod} />
            <PeriodButton label="This Month" period="month" currentPeriod={period} onClick={setPeriod} />
            <PeriodButton label="All Time" period="all" currentPeriod={period} onClick={setPeriod} />
          </div>
        </div>

        {/* Main Metrics Card */}
        <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#007fff]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Performance Metrics</h3>
                <p className="text-sm text-gray-500">Key performance indicators</p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Conversations"
                value={stats.totalConversations.toLocaleString()}
                icon={<MessageSquare className="h-4 w-4 text-[#007fff]" />}
                color="blue"
              />
              <MetricCard
                title="Active Tickets"
                value={stats.activeConversations.toLocaleString()}
                icon={<Users className="h-4 w-4 text-purple-600" />}
                color="purple"
              />
              <MetricCard
                title="Resolved"
                value={stats.resolvedTickets.toLocaleString()}
                subtitle="tickets closed"
                icon={<ArrowUpRight className="h-4 w-4 text-green-600" />}
                color="green"
              />
              <MetricCard
                title="Escalations"
                value={stats.totalEscalations.toLocaleString()}
                subtitle={`${stats.pendingEscalations} pending`}
                icon={<AlertCircle className="h-4 w-4 text-[#b42318]" />}
                color="red"
              />
            </div>
          </div>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Conversation Trend Chart */}
          {stats.conversationTrend.length > 0 && (
            <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Conversation Trend</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Conversations over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.conversationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#999"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#999"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#007fff"
                      fill="#e6f2ff"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Message Trend Chart */}
          {stats.messageTrend.length > 0 && (
            <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Message Volume</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Messages sent over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.messageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#999"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#999"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom Row Cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Recent Escalations */}
          <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Escalations</h3>
                <p className="text-sm text-gray-500">High priority items</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.recentEscalations.length > 0 ? (
                stats.recentEscalations.map((escalation) => (
                  <div key={escalation.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      escalation.priority === 'high'
                        ? 'bg-red-50 text-red-500'
                        : escalation.priority === 'medium'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {escalation.priority}
                    </span>
                    <p className="mt-2 text-sm text-gray-900">{escalation.message}</p>
                    <p className="text-xs text-gray-500">{escalation.timestamp}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent escalations</p>
              )}
            </div>
          </Card>

          {/* Token Usage */}
          <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#007fff]">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Token Usage</h3>
                <p className="text-sm text-gray-500">AI API consumption</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Used: {stats.tokensUsed.toLocaleString()}</span>
                <span>Limit: {stats.tokensLimit.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.tokenUsagePercent > 80 ? 'bg-red-500' : 'bg-[#007fff]'
                  }`}
                  style={{ width: `${Math.min(stats.tokenUsagePercent, 100)}%` }}
                />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Est. Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${stats.estimatedCost.toFixed(2)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  stats.tokenUsagePercent > 80
                    ? 'bg-red-50 text-red-600'
                    : 'bg-[#e6f2ff] text-[#007fff]'
                }`}>
                  {stats.tokenUsagePercent}%
                </span>
              </div>
            </div>
          </Card>

          {/* Channel Breakdown */}
          <Card className="rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-500">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Channel Breakdown</h3>
                <p className="text-sm text-gray-500">Conversations by channel</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(stats.channelStats).map(([channel, count]) => {
                if (count === 0) return null;
                const total = Object.values(stats.channelStats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={channel} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{channel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#007fff] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* Channels Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Channels</h2>
          <p className="text-sm text-gray-500">
            Manage your communication channels
          </p>
        </div>
        <Channels
          onWhatsAppCreate={() => setWhatsappDialogOpen(true)}
          onWebsiteCreate={() => setWebsiteDialogOpen(true)}
        />
      </section>

      {/* Dialogs */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-4xl">
          <WhatsappOnboarding />
        </DialogContent>
      </Dialog>

      <Dialog open={websiteDialogOpen} onOpenChange={setWebsiteDialogOpen}>
        <DialogContent className="max-w-4xl">
          <UnifiedWidgets />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicDashboard;
