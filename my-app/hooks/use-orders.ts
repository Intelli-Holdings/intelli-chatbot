import { useState, useEffect, useCallback } from 'react';
import { OrdersService } from '@/services/orders';
import type {
  WhatsAppOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderQueryFilters,
  OrderStatus,
} from '@/types/ecommerce';
import useActiveOrganizationId from './use-organization-id';

// =============================================================================
// ORDERS HOOK
// =============================================================================

export interface UseOrdersReturn {
  orders: WhatsAppOrder[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: OrderQueryFilters;
  setFilters: (filters: OrderQueryFilters) => void;
  createOrder: (order: CreateOrderRequest) => Promise<WhatsAppOrder>;
  updateOrder: (orderId: string, updates: UpdateOrderRequest) => Promise<WhatsAppOrder>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<WhatsAppOrder>;
  cancelOrder: (orderId: string, reason?: string) => Promise<WhatsAppOrder>;
  saving: boolean;
}

/**
 * Hook to manage orders
 */
export const useOrders = (initialFilters: OrderQueryFilters = {}): UseOrdersReturn => {
  const organizationId = useActiveOrganizationId();
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderQueryFilters>(initialFilters);

  const fetchOrders = useCallback(async () => {
    if (!organizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await OrdersService.getOrders(organizationId, filters);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      let errorMessage = 'Failed to fetch orders';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters]);

  const createOrder = useCallback(
    async (order: CreateOrderRequest): Promise<WhatsAppOrder> => {
      if (!organizationId) {
        throw new Error('Organization ID not available');
      }

      setSaving(true);
      setError(null);

      try {
        const newOrder = await OrdersService.createOrder(organizationId, order);
        setOrders((prev) => [newOrder, ...prev]);
        setTotal((prev) => prev + 1);
        return newOrder;
      } catch (err) {
        let errorMessage = 'Failed to create order';
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

  const updateOrder = useCallback(
    async (orderId: string, updates: UpdateOrderRequest): Promise<WhatsAppOrder> => {
      setSaving(true);
      setError(null);

      try {
        const updatedOrder = await OrdersService.updateOrder(orderId, updates);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        return updatedOrder;
      } catch (err) {
        let errorMessage = 'Failed to update order';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      await OrdersService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      let errorMessage = 'Failed to delete order';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (
      orderId: string,
      status: OrderStatus,
      notes?: string
    ): Promise<WhatsAppOrder> => {
      return updateOrder(orderId, { status, notes });
    },
    [updateOrder]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason?: string): Promise<WhatsAppOrder> => {
      return updateOrder(orderId, { status: 'cancelled', notes: reason });
    },
    [updateOrder]
  );

  useEffect(() => {
    if (organizationId) {
      fetchOrders();
    }
  }, [organizationId, fetchOrders]);

  return {
    orders,
    total,
    loading,
    error,
    refetch: fetchOrders,
    filters,
    setFilters,
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    cancelOrder,
    saving,
  };
};

// =============================================================================
// SINGLE ORDER HOOK
// =============================================================================

export interface UseOrderReturn {
  order: WhatsAppOrder | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrder: (updates: UpdateOrderRequest) => Promise<WhatsAppOrder>;
  updateStatus: (status: OrderStatus, notes?: string) => Promise<WhatsAppOrder>;
  sendPaymentLink: (provider: string) => Promise<void>;
  sendConfirmation: () => Promise<void>;
  cancelOrder: (reason?: string) => Promise<WhatsAppOrder>;
  saving: boolean;
}

/**
 * Hook to manage a single order
 */
export const useOrder = (orderId: string | null): UseOrderReturn => {
  const [order, setOrder] = useState<WhatsAppOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await OrdersService.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch order';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const updateOrder = useCallback(
    async (updates: UpdateOrderRequest): Promise<WhatsAppOrder> => {
      if (!orderId) {
        throw new Error('Order ID not available');
      }

      setSaving(true);
      setError(null);

      try {
        const updatedOrder = await OrdersService.updateOrder(orderId, updates);
        setOrder(updatedOrder);
        return updatedOrder;
      } catch (err) {
        let errorMessage = 'Failed to update order';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [orderId]
  );

  const updateStatus = useCallback(
    async (status: OrderStatus, notes?: string): Promise<WhatsAppOrder> => {
      return updateOrder({ status, notes });
    },
    [updateOrder]
  );

  const sendPaymentLink = useCallback(
    async (provider: string): Promise<void> => {
      if (!orderId || !order) {
        throw new Error('Order not available');
      }

      setSaving(true);
      setError(null);

      try {
        await OrdersService.sendPaymentLink(orderId, provider, order.customer_phone);
      } catch (err) {
        let errorMessage = 'Failed to send payment link';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [orderId, order]
  );

  const sendConfirmation = useCallback(async (): Promise<void> => {
    if (!orderId || !order) {
      throw new Error('Order not available');
    }

    setSaving(true);
    setError(null);

    try {
      await OrdersService.sendConfirmation(orderId, order.customer_phone);
    } catch (err) {
      let errorMessage = 'Failed to send confirmation';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [orderId, order]);

  const cancelOrder = useCallback(
    async (reason?: string): Promise<WhatsAppOrder> => {
      return updateOrder({ status: 'cancelled', notes: reason });
    },
    [updateOrder]
  );

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    updateOrder,
    updateStatus,
    sendPaymentLink,
    sendConfirmation,
    cancelOrder,
    saving,
  };
};

// =============================================================================
// ORDER STATS HOOK
// =============================================================================

export interface UseOrderStatsReturn {
  stats: {
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
    currency: string;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get order statistics
 */
export const useOrderStats = (
  dateFrom?: string,
  dateTo?: string
): UseOrderStatsReturn => {
  const organizationId = useActiveOrganizationId();
  const [stats, setStats] = useState<UseOrderStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!organizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await OrdersService.getOrderStats(organizationId, dateFrom, dateTo);
      setStats(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch order stats';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error fetching order stats:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, dateFrom, dateTo]);

  useEffect(() => {
    if (organizationId) {
      fetchStats();
    }
  }, [organizationId, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export default useOrders;
