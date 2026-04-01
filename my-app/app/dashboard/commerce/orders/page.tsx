'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Send,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  DollarSign,
  Banknote,
  ShoppingBag,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useOrders, useOrderStats } from '@/hooks/use-orders';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CommerceEmptyState } from '@/components/commerce';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppOrder, OrderStatus } from '@/types/ecommerce';
import { formatCurrency, type SupportedCurrency } from '@/types/ecommerce';
import { getProvidersForCurrency, PAYMENT_PROVIDERS, type PaymentProvider } from '@/types/payments';
import { getRecommendedProviders } from '@/lib/payment-market-map';
import { OrdersService } from '@/services/orders';
import { exportOrdersToCSV } from '@/lib/export-csv';
import useActiveOrganizationId from '@/hooks/use-organization-id';

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }
> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  paid: { label: 'Paid', variant: 'default', icon: DollarSign },
  processing: { label: 'Processing', variant: 'secondary', icon: Package },
  shipped: { label: 'Shipped', variant: 'default', icon: Truck },
  delivered: { label: 'Delivered', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  refunded: { label: 'Refunded', variant: 'outline', icon: DollarSign },
};

export default function OrdersPage() {
  const organizationId = useActiveOrganizationId();
  const {
    orders,
    total,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    updateStatus,
    cancelOrder,
    saving,
  } = useOrders({ limit: 10 });

  const { stats, loading: loadingStats } = useOrderStats();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WhatsAppOrder | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false);
  const [paymentLinkOrder, setPaymentLinkOrder] = useState<WhatsAppOrder | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | ''>('');
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Sync date range to filters
  useEffect(() => {
    setFilters({
      ...filters,
      date_from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      date_to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      offset: 0,
    });
  }, [dateRange]);

  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState<OrderStatus>('confirmed');

  const pageSize = 10;
  const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    []
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({
        ...filters,
        customer_phone: searchQuery || undefined,
        offset: 0,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStatusFilter = useCallback(
    (status: string) => {
      setFilters({
        ...filters,
        status: status === 'all' ? undefined : (status as OrderStatus),
        offset: 0,
      });
    },
    [filters, setFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({
        ...filters,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
    },
    [filters, setFilters, pageSize]
  );

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateStatus(selectedOrder.id, newStatus);
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
      setStatusDialogOpen(false);
      setSelectedOrder(null);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      await cancelOrder(selectedOrder.id, 'Cancelled by agent');
      toast.success('Order cancelled');
      setCancelDialogOpen(false);
      setSelectedOrder(null);
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const openStatusDialog = (order: WhatsAppOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status === 'pending' ? 'confirmed' : 'shipped');
    setStatusDialogOpen(true);
  };

  const openCancelDialog = (order: WhatsAppOrder) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const openPaymentLinkDialog = (order: WhatsAppOrder) => {
    setPaymentLinkOrder(order);
    // Auto-select best provider based on customer phone
    const recommended = getRecommendedProviders(order.customer_phone, order.currency);
    const available = getProvidersForCurrency(order.currency);
    const best = recommended.length > 0 ? recommended[0] : available.length > 0 ? available[0] : '';
    setSelectedProvider(best);
    setPaymentLinkDialogOpen(true);
  };

  const handleSendPaymentLink = async () => {
    if (!paymentLinkOrder || !selectedProvider || !organizationId) return;

    setSendingPaymentLink(true);
    try {
      await OrdersService.sendPaymentLink(
        organizationId,
        paymentLinkOrder.id,
        selectedProvider,
        paymentLinkOrder.customer_phone
      );
      toast.success('Payment link sent successfully');
      setPaymentLinkDialogOpen(false);
      setPaymentLinkOrder(null);
      setSelectedProvider('');
      refetch();
    } catch {
      toast.error('Failed to send payment link');
    } finally {
      setSendingPaymentLink(false);
    }
  };


  const handleExportCSV = () => {
    exportOrdersToCSV(orders);
  };

  // Bulk selection helpers
  const toggleOrder = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const handleBulkUpdateStatus = async () => {
    const ids = Array.from(selectedOrders);
    const results = await Promise.allSettled(
      ids.map((id) => updateStatus(id, bulkNewStatus))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const total = ids.length;

    if (succeeded === total) {
      toast.success(`${succeeded} of ${total} orders updated`);
    } else if (succeeded > 0) {
      toast.warning(`${succeeded} of ${total} orders updated, ${total - succeeded} failed`);
    } else {
      toast.error(`Failed to update orders`);
    }

    setBulkStatusDialogOpen(false);
    clearSelection();
  };

  const handleExportSelected = () => {
    const selected = orders.filter((o) => selectedOrders.has(o.id));
    if (selected.length === 0) {
      toast.error('No orders selected');
      return;
    }
    exportOrdersToCSV(selected, `orders-selected-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-golden-heading font-semibold tracking-tight">Orders</h2>
          <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
            Manage your WhatsApp Commerce orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={loading || orders.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={refetch} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_revenue, stats.currency as SupportedCurrency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending_orders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed_orders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.average_order_value, stats.currency as SupportedCurrency)}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={(filters.status as string) || 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setBulkStatusDialogOpen(true)}>Update Status</Button>
          <Button variant="outline" size="sm" onClick={handleExportSelected}>Export Selected</Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-320px)]">
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        orders.length > 0 && selectedOrders.size === orders.length
                          ? true
                          : selectedOrders.size > 0
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={toggleAllOrders}
                      aria-label="Select all orders"
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && orders.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <CommerceEmptyState type="orders" />
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={() => toggleOrder(order.id)}
                            aria-label={`Select order ${order.id.slice(0, 8)}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.customer_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.length} item
                          {order.items.length !== 1 && 's'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(
                            order.total_amount,
                            order.currency as SupportedCurrency
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(() => {
                            const date = new Date(order.created_at);
                            const hoursDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60);
                            return hoursDiff < 24
                              ? formatDistanceToNow(date, { addSuffix: true })
                              : format(date, 'MMM d, yyyy');
                          })()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Order actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/commerce/orders/${order.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {order.status !== 'delivered' &&
                                order.status !== 'cancelled' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openStatusDialog(order)}
                                    >
                                      Update Status
                                    </DropdownMenuItem>
                                    {order.status === 'pending' && (
                                      <DropdownMenuItem
                                        onClick={() => openPaymentLinkDialog(order)}
                                      >
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Payment Link
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => openCancelDialog(order)}
                                    >
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig)
                  .filter(([s]) => s !== 'cancelled' && s !== 'refunded')
                  .map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={saving}>
              {saving ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={saving}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={saving}
            >
              {saving ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Payment Link Dialog */}
      <Dialog open={paymentLinkDialogOpen} onOpenChange={setPaymentLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Link</DialogTitle>
            <DialogDescription>
              Choose a payment provider and send a payment link to the customer.
            </DialogDescription>
          </DialogHeader>
          {paymentLinkOrder && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                Sending to: <span className="font-medium text-foreground">{paymentLinkOrder.customer_phone}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Amount: <span className="font-medium text-foreground">
                  {formatCurrency(paymentLinkOrder.total_amount, paymentLinkOrder.currency as SupportedCurrency)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Provider</label>
                <Select
                  value={selectedProvider}
                  onValueChange={(v) => setSelectedProvider(v as PaymentProvider)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {getProvidersForCurrency(paymentLinkOrder.currency).map((provider) => {
                      const info = PAYMENT_PROVIDERS[provider];
                      return (
                        <SelectItem key={provider} value={provider}>
                          {info.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <p className="font-medium">{PAYMENT_PROVIDERS[selectedProvider as PaymentProvider].name}</p>
                  <p className="text-muted-foreground">
                    Payment methods: {PAYMENT_PROVIDERS[selectedProvider as PaymentProvider].payment_methods.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentLinkDialogOpen(false)}
              disabled={sendingPaymentLink}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendPaymentLink}
              disabled={sendingPaymentLink || !selectedProvider}
            >
              {sendingPaymentLink ? 'Sending...' : 'Send Payment Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Status Dialog */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status for {selectedOrders.size} Order{selectedOrders.size !== 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Change the status of all selected orders at once.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={bulkNewStatus}
              onValueChange={(v) => setBulkNewStatus(v as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig)
                  .filter(([s]) => s !== 'cancelled' && s !== 'refunded')
                  .map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkStatusDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkUpdateStatus} disabled={saving}>
              {saving ? 'Updating...' : `Update ${selectedOrders.size} Order${selectedOrders.size !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
