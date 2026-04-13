import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PaymentService } from '@/services/payments';
import type {
  PaymentProvider,
  PaymentConfigResponse,
  CreatePaymentConfigRequest,
  UpdatePaymentConfigRequest,
  PaymentTransaction,
  TransactionQueryFilters,
  TransactionStats,
  TestConfigResult,
} from '@/types/payments';
import useActiveOrganizationId from './use-organization-id';

// =============================================================================
// PAYMENT CONFIGS HOOK
// =============================================================================

export interface UsePaymentConfigsReturn {
  configs: PaymentConfigResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createConfig: (config: CreatePaymentConfigRequest) => Promise<PaymentConfigResponse>;
  updateConfig: (configId: string, updates: UpdatePaymentConfigRequest) => Promise<PaymentConfigResponse>;
  deleteConfig: (configId: string) => Promise<void>;
  testConfig: (configId: string) => Promise<TestConfigResult>;
  getConfigForProvider: (provider: PaymentProvider) => PaymentConfigResponse | null;
  saving: boolean;
  testing: boolean;
}

/**
 * Hook to manage payment configurations
 */
export const usePaymentConfigs = (): UsePaymentConfigsReturn => {
  const { isLoaded, isSignedIn } = useAuth();
  const organizationId = useActiveOrganizationId();
  const [configs, setConfigs] = useState<PaymentConfigResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!organizationId || !isLoaded || !isSignedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await PaymentService.getConfigs(organizationId);
      setConfigs(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch payment configs';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching payment configs:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, isLoaded, isSignedIn]);

  const createConfig = useCallback(
    async (config: CreatePaymentConfigRequest): Promise<PaymentConfigResponse> => {
      if (!organizationId) {
        throw new Error('Organization ID not available');
      }

      setSaving(true);
      setError(null);

      try {
        const newConfig = await PaymentService.createConfig(organizationId, config);
        setConfigs((prev) => [...prev, newConfig]);
        return newConfig;
      } catch (err) {
        let errorMessage = 'Failed to create payment config';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [organizationId]
  );

  const updateConfig = useCallback(
    async (
      configId: string,
      updates: UpdatePaymentConfigRequest
    ): Promise<PaymentConfigResponse> => {
      if (!organizationId) {
        throw new Error('Organization ID not available');
      }

      setSaving(true);
      setError(null);

      try {
        const updatedConfig = await PaymentService.updateConfig(organizationId, configId, updates);
        setConfigs((prev) =>
          prev.map((c) => (c.id === configId ? updatedConfig : c))
        );
        return updatedConfig;
      } catch (err) {
        let errorMessage = 'Failed to update payment config';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [organizationId]
  );

  const deleteConfig = useCallback(async (configId: string): Promise<void> => {
    if (!organizationId) {
      throw new Error('Organization ID not available');
    }

    setSaving(true);
    setError(null);

    try {
      await PaymentService.deleteConfig(organizationId, configId);
      setConfigs((prev) => prev.filter((c) => c.id !== configId));
    } catch (err) {
      let errorMessage = 'Failed to delete payment config';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [organizationId]);

  const testConfig = useCallback(
    async (configId: string): Promise<TestConfigResult> => {
      if (!organizationId) {
        return { success: false, message: 'Organization ID not available' };
      }

      setTesting(true);

      try {
        return await PaymentService.testConfig(organizationId, configId);
      } finally {
        setTesting(false);
      }
    },
    [organizationId]
  );

  const getConfigForProvider = useCallback(
    (provider: PaymentProvider): PaymentConfigResponse | null => {
      return configs.find((c) => c.provider === provider) || null;
    },
    [configs]
  );

  useEffect(() => {
    if (organizationId && isLoaded && isSignedIn) {
      fetchConfigs();
    }
  }, [organizationId, isLoaded, isSignedIn, fetchConfigs]);

  return {
    configs,
    loading,
    error,
    refetch: fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    testConfig,
    getConfigForProvider,
    saving,
    testing,
  };
};

// =============================================================================
// TRANSACTIONS HOOK
// =============================================================================

export interface UseTransactionsReturn {
  transactions: PaymentTransaction[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: TransactionQueryFilters;
  setFilters: (filters: TransactionQueryFilters) => void;
  refundTransaction: (transactionId: string, amount?: number) => Promise<void>;
  refunding: boolean;
}

/**
 * Hook to manage payment transactions
 */
export const useTransactions = (
  initialFilters: TransactionQueryFilters = {}
): UseTransactionsReturn => {
  const { isLoaded, isSignedIn } = useAuth();
  const organizationId = useActiveOrganizationId();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionQueryFilters>(initialFilters);

  const fetchTransactions = useCallback(async () => {
    if (!organizationId || !isLoaded || !isSignedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await PaymentService.getTransactions(organizationId, filters);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (err) {
      let errorMessage = 'Failed to fetch transactions';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters, isLoaded, isSignedIn]);

  const refundTransaction = useCallback(
    async (transactionId: string, amount?: number): Promise<void> => {
      if (!organizationId) {
        throw new Error('Organization ID not available');
      }

      setRefunding(true);
      setError(null);

      try {
        const refundedTransaction = await PaymentService.refundTransaction(
          organizationId,
          transactionId,
          amount
        );
        // Update transaction in list
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? refundedTransaction : t))
        );
      } catch (err) {
        let errorMessage = 'Failed to refund transaction';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setRefunding(false);
      }
    },
    [organizationId]
  );

  useEffect(() => {
    if (organizationId && isLoaded && isSignedIn) {
      fetchTransactions();
    }
  }, [organizationId, isLoaded, isSignedIn, fetchTransactions]);

  return {
    transactions,
    total,
    loading,
    error,
    refetch: fetchTransactions,
    filters,
    setFilters,
    refundTransaction,
    refunding,
  };
};

// =============================================================================
// TRANSACTION STATS HOOK
// =============================================================================

export interface UseTransactionStatsReturn {
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get transaction statistics
 */
export const useTransactionStats = (
  dateFrom?: string,
  dateTo?: string
): UseTransactionStatsReturn => {
  const { isLoaded, isSignedIn } = useAuth();
  const organizationId = useActiveOrganizationId();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!organizationId || !isLoaded || !isSignedIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await PaymentService.getTransactionStats(
        organizationId,
        dateFrom,
        dateTo
      );
      setStats(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch transaction stats';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching transaction stats:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, dateFrom, dateTo, isLoaded, isSignedIn]);

  useEffect(() => {
    if (organizationId && isLoaded && isSignedIn) {
      fetchStats();
    }
  }, [organizationId, isLoaded, isSignedIn, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default usePaymentConfigs;
