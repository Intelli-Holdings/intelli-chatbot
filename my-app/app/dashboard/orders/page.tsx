'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
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
  ShoppingBag,
  Clock,
  AlertCircle,
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppOrder, OrderStatus } from '@/types/ecommerce';
import { formatCurrency, type SupportedCurrency } from '@/types/ecommerce';

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

  const pageSize = 10;
  const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setFilters({
        ...filters,
        customer_phone: query || undefined,
        offset: 0,
      });
    },
    [filters, setFilters]
  );

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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp Commerce orders
          </p>
        </div>
        <Button onClick={refetch} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {!loadingStats && stats && (
        <div className="grid gap-4 md:grid-cols-4">
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
        </div>
      )}

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
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const statusInfo = statusConfig[order.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={order.id}>
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
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/orders/${order.id}`}>
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
                                      <DropdownMenuItem>
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
        </CardContent>
      </Card>

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
    </div>
  );
}
