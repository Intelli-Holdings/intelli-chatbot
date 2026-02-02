'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SettingsSearch } from '@/components/settings-search';
import {
  usePaymentConfigs,
  useTransactions,
  useTransactionStats,
} from '@/hooks/use-payments';
import {
  PaymentProviderCard,
  PaymentConfigForm,
  TransactionHistory,
} from '@/components/payments';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  PaymentProvider,
  CreatePaymentConfigRequest,
} from '@/types/payments';
import { PAYMENT_PROVIDERS, formatPaymentAmount } from '@/types/payments';

const settingsNavigation = [
  {
    title: 'General',
    href: '/dashboard/settings',
  },
  {
    title: 'Automation',
    href: '/dashboard/settings/automation',
  },
  {
    title: 'Custom Fields',
    href: '/dashboard/settings/custom-fields',
  },
  {
    title: 'Escalation Events',
    href: '/dashboard/settings/escalation-events',
  },
  {
    title: 'Catalogue',
    href: '/dashboard/settings/catalogue',
  },
  {
    title: 'Payments',
    href: '/dashboard/settings/payments',
  },
];

export default function PaymentsSettingsPage() {
  const pathname = usePathname();

  // Payment configs
  const {
    configs,
    loading: loadingConfigs,
    error: configsError,
    refetch: refetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    testConfig,
    getConfigForProvider,
    saving,
    testing,
  } = usePaymentConfigs();

  // Transactions
  const {
    transactions,
    total,
    loading: loadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
    filters,
    setFilters,
    refundTransaction,
    refunding,
  } = useTransactions({ limit: 10 });

  // Transaction stats
  const { stats, loading: loadingStats } = useTransactionStats();

  // Form state
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [togglingConfigId, setTogglingConfigId] = useState<string | null>(null);
  const [testingConfigId, setTestingConfigId] = useState<string | null>(null);
  const [deletingConfig, setDeletingConfig] = useState(false);

  const handleConfigureProvider = useCallback((provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setConfigFormOpen(true);
  }, []);

  const handleToggleConfig = useCallback(
    async (configId: string, active: boolean) => {
      setTogglingConfigId(configId);
      try {
        await updateConfig(configId, { is_active: active });
        toast.success(active ? 'Payment provider enabled' : 'Payment provider disabled');
      } catch {
        toast.error('Failed to update payment provider');
      } finally {
        setTogglingConfigId(null);
      }
    },
    [updateConfig]
  );

  const handleTestConfig = useCallback(
    async (configId: string) => {
      setTestingConfigId(configId);
      try {
        const result = await testConfig(configId);
        if (result.success) {
          toast.success(result.message || 'Configuration test successful');
        } else {
          toast.error(result.message || 'Configuration test failed');
        }
      } catch {
        toast.error('Failed to test configuration');
      } finally {
        setTestingConfigId(null);
      }
    },
    [testConfig]
  );

  const handleSubmitConfig = useCallback(
    async (config: CreatePaymentConfigRequest) => {
      if (!selectedProvider) return;

      const existingConfig = getConfigForProvider(selectedProvider);

      try {
        if (existingConfig) {
          await updateConfig(existingConfig.id, config as any);
          toast.success('Payment configuration updated');
        } else {
          await createConfig(config);
          toast.success('Payment configuration created');
        }
        setConfigFormOpen(false);
        setSelectedProvider(null);
      } catch {
        toast.error('Failed to save payment configuration');
      }
    },
    [selectedProvider, getConfigForProvider, updateConfig, createConfig]
  );

  const handleDeleteConfig = useCallback(async () => {
    if (!selectedProvider) return;

    const existingConfig = getConfigForProvider(selectedProvider);
    if (!existingConfig) return;

    setDeletingConfig(true);
    try {
      await deleteConfig(existingConfig.id);
      toast.success('Payment configuration deleted');
      setConfigFormOpen(false);
      setSelectedProvider(null);
    } catch {
      toast.error('Failed to delete payment configuration');
    } finally {
      setDeletingConfig(false);
    }
  }, [selectedProvider, getConfigForProvider, deleteConfig]);

  const handleRefund = useCallback(
    async (transactionId: string, amount?: number) => {
      try {
        await refundTransaction(transactionId, amount);
        toast.success('Refund processed successfully');
      } catch {
        toast.error('Failed to process refund');
      }
    },
    [refundTransaction]
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <span>&larr; Go to Dashboard</span>
            </Link>
          </div>

          {/* Search */}
          <div className="border-b border-border p-4">
            <SettingsSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {settingsNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              <div>
                <h2 className="text-3xl font-bold">Payments</h2>
                <p className="mt-1 text-muted-foreground">
                  Configure payment providers and manage transactions
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="providers" className="space-y-6">
            <TabsList>
              <TabsTrigger value="providers">Payment Providers</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {/* Payment Providers Tab */}
            <TabsContent value="providers" className="space-y-6">
              {/* Stats Overview */}
              {!loadingStats && stats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatPaymentAmount(stats.successful_amount, stats.currency)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From {stats.successful_count} transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Successful
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.successful_count}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending
                      </CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.pending_count}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Failed</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {stats.failed_count}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Provider Cards */}
              {configsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{configsError}</AlertDescription>
                </Alert>
              )}

              {loadingConfigs ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[200px]" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(Object.keys(PAYMENT_PROVIDERS) as PaymentProvider[]).map(
                    (provider) => (
                      <PaymentProviderCard
                        key={provider}
                        provider={provider}
                        config={getConfigForProvider(provider)}
                        onConfigure={handleConfigureProvider}
                        onToggle={handleToggleConfig}
                        onTest={handleTestConfig}
                        testing={testingConfigId === getConfigForProvider(provider)?.id}
                        toggling={togglingConfigId === getConfigForProvider(provider)?.id}
                      />
                    )
                  )}
                </div>
              )}
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View and manage all payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionHistory
                    transactions={transactions}
                    total={total}
                    loading={loadingTransactions}
                    error={transactionsError}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onRefresh={refetchTransactions}
                    onRefund={handleRefund}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Config Form Dialog */}
          {selectedProvider && (
            <PaymentConfigForm
              provider={selectedProvider}
              existingConfig={getConfigForProvider(selectedProvider)}
              open={configFormOpen}
              onOpenChange={(open) => {
                setConfigFormOpen(open);
                if (!open) setSelectedProvider(null);
              }}
              onSubmit={handleSubmitConfig}
              onDelete={
                getConfigForProvider(selectedProvider)
                  ? handleDeleteConfig
                  : undefined
              }
              saving={saving}
              deleting={deletingConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}
