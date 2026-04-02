'use client';

import { useState, useCallback } from 'react';
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
  Banknote,
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

export default function PaymentsPage() {
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-golden-heading font-semibold tracking-tight">Payments</h2>
        <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
          Configure payment providers and manage transactions
        </p>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
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
      ) : null}

      {/* Tabs: Transactions | Providers */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="providers" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Providers
          </TabsTrigger>
        </TabsList>

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

        {/* Payment Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
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
  );
}
