'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useOrderStats } from '@/hooks/use-orders';
import { useTransactionStats } from '@/hooks/use-payments';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { PaymentService } from '@/services/payments';
import { formatCurrency, SupportedCurrency } from '@/types/ecommerce';
import { PAYMENT_PROVIDERS } from '@/types/payments';

// =============================================================================
// CONSTANTS
// =============================================================================

const PERIOD_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
] as const;

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Completed: '#10b981',
  Cancelled: '#ef4444',
};

const PROVIDER_COLORS: Record<string, string> = {
  paystack: '#00C3F7',
  flutterwave: '#FF5805',
  mpesa: '#39b54a',
  momo: '#ffcb05',
  pesapal: '#1a3a6b',
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function CommerceAnalyticsPage() {
  const [period, setPeriod] = useState<number>(30);
  const organizationId = useActiveOrganizationId();

  const { stats: orderStats, loading: ordersLoading } = useOrderStats();
  const { stats: txStats, loading: txLoading } = useTransactionStats();

  const [revenueData, setRevenueData] = useState<
    { date: string; revenue: number; orders: number }[]
  >([]);
  const [providerData, setProviderData] = useState<
    { provider: string; name: string; count: number; amount: number }[]
  >([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const loading = ordersLoading || txLoading;
  const currency = (orderStats?.currency ?? txStats?.currency ?? 'USD') as SupportedCurrency;

  const fetchChartData = useCallback(async () => {
    if (!organizationId) return;
    setChartsLoading(true);
    try {
      const [revenue, providers] = await Promise.allSettled([
        PaymentService.getRevenueTimeSeries(organizationId, period),
        PaymentService.getProviderBreakdown(organizationId, period),
      ]);

      if (revenue.status === 'fulfilled') {
        setRevenueData(
          revenue.value.map((d) => ({
            ...d,
            date: format(new Date(d.date), 'MMM d'),
          }))
        );
      }

      if (providers.status === 'fulfilled') {
        setProviderData(
          providers.value.map((d) => ({
            ...d,
            name:
              PAYMENT_PROVIDERS[d.provider as keyof typeof PAYMENT_PROVIDERS]
                ?.name ?? d.provider,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartsLoading(false);
    }
  }, [organizationId, period]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Order status breakdown (from real stats)
  const orderStatusData =
    orderStats
      ? [
          { name: 'Pending', value: orderStats.pending_orders },
          { name: 'Completed', value: orderStats.completed_orders },
          { name: 'Cancelled', value: orderStats.cancelled_orders },
        ]
      : [];

  const successRate =
    txStats && txStats.total_count > 0
      ? Math.round((txStats.successful_count / txStats.total_count) * 100)
      : 0;

  const successRateColor =
    !txStats || txStats.total_count === 0
      ? 'hsl(var(--muted-foreground))'
      : successRate > 90 ? '#10b981' : successRate > 70 ? '#f59e0b' : '#44d0ef';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-golden-heading font-semibold tracking-tight">Analytics</h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Overview of your commerce performance and payment metrics.
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={period === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={
            orderStats
              ? formatCurrency(orderStats.total_revenue, currency)
              : '--'
          }
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={orderStats?.total_orders?.toString() ?? '--'}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatsCard
          title="Avg Order Value"
          value={
            orderStats
              ? formatCurrency(orderStats.average_order_value, currency)
              : '--'
          }
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatsCard
          title="Transactions"
          value={txStats?.total_count?.toString() ?? '--'}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : revenueData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No revenue data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={period > 30 ? Math.floor(period / 10) : undefined}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        formatCurrency(v, currency).replace(/\.00$/, '')
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value, currency),
                        'Revenue',
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : orderStatusData.every((d) => d.value === 0) ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No order data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine
                    >
                      {orderStatusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            STATUS_COLORS[
                              entry.name as keyof typeof STATUS_COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Providers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartsLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : providerData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No transaction data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={providerData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, 'Transactions']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {providerData.map((entry) => (
                        <Cell
                          key={entry.provider}
                          fill={PROVIDER_COLORS[entry.provider] ?? '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <p
                className="text-5xl font-bold"
                style={{ color: successRateColor }}
              >
                {txStats ? `${successRate}%` : '--'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {txStats
                  ? `${txStats.successful_count} of ${txStats.total_count} transactions`
                  : 'No data available'}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${successRate}%`,
                    backgroundColor: successRateColor,
                  }}
                />
              </div>
            </div>

            {txStats && (
              <div className="grid w-full max-w-xs grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-semibold text-green-600">
                    {txStats.successful_count}
                  </p>
                  <p className="text-muted-foreground">Successful</p>
                </div>
                <div>
                  <p className="font-semibold text-yellow-600">
                    {txStats.pending_count}
                  </p>
                  <p className="text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="font-semibold text-red-600">
                    {txStats.failed_count}
                  </p>
                  <p className="text-muted-foreground">Failed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// STATS CARD COMPONENT
// =============================================================================

function StatsCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
