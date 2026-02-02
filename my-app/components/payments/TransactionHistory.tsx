'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  MoreVertical,
  RotateCcw,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type {
  PaymentTransaction,
  PaymentProvider,
  PaymentStatus,
  TransactionQueryFilters,
} from '@/types/payments';
import {
  formatPaymentAmount,
  getStatusLabel,
  getStatusColor,
  PAYMENT_PROVIDERS,
} from '@/types/payments';

interface TransactionHistoryProps {
  transactions: PaymentTransaction[];
  total: number;
  loading?: boolean;
  error?: string | null;
  filters?: TransactionQueryFilters;
  onFiltersChange?: (filters: TransactionQueryFilters) => void;
  onRefresh?: () => Promise<void>;
  onRefund?: (transactionId: string, amount?: number) => Promise<void>;
  pageSize?: number;
  className?: string;
}

export function TransactionHistory({
  transactions,
  total,
  loading = false,
  error = null,
  filters = {},
  onFiltersChange,
  onRefresh,
  onRefund,
  pageSize = 10,
  className,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [refunding, setRefunding] = useState(false);

  const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onFiltersChange?.({
        ...filters,
        reference: query || undefined,
        offset: 0,
      });
    },
    [filters, onFiltersChange]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      onFiltersChange?.({
        ...filters,
        status: status === 'all' ? undefined : (status as PaymentStatus),
        offset: 0,
      });
    },
    [filters, onFiltersChange]
  );

  const handleProviderFilter = useCallback(
    (provider: string) => {
      onFiltersChange?.({
        ...filters,
        provider: provider === 'all' ? undefined : (provider as PaymentProvider),
        offset: 0,
      });
    },
    [filters, onFiltersChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      onFiltersChange?.({
        ...filters,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
    },
    [filters, onFiltersChange, pageSize]
  );

  const handleRefund = async () => {
    if (!selectedTransaction || !onRefund) return;

    setRefunding(true);
    try {
      await onRefund(selectedTransaction.id);
      setRefundDialogOpen(false);
      setSelectedTransaction(null);
    } finally {
      setRefunding(false);
    }
  };

  const openRefundDialog = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setRefundDialogOpen(true);
  };

  // Loading skeleton
  if (loading && transactions.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={(filters.status as string) || 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={(filters.provider as string) || 'all'}
          onValueChange={handleProviderFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {Object.keys(PAYMENT_PROVIDERS).map((provider) => (
              <SelectItem key={provider} value={provider}>
                {PAYMENT_PROVIDERS[provider as PaymentProvider].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onRefresh && (
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Transactions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {transaction.reference}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPaymentAmount(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PAYMENT_PROVIDERS[transaction.provider]?.name || transaction.provider}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.customer_phone || transaction.customer_email || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {transaction.status === 'completed' && onRefund && (
                          <DropdownMenuItem onClick={() => openRefundDialog(transaction)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                        {transaction.order_id && (
                          <DropdownMenuItem asChild>
                            <a href={`/dashboard/orders/${transaction.order_id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Order
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} transactions
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

      {/* Refund dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this transaction?
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Reference:</span>{' '}
                <span className="font-mono">{selectedTransaction.reference}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Amount:</span>{' '}
                <span className="font-medium">
                  {formatPaymentAmount(
                    selectedTransaction.amount,
                    selectedTransaction.currency
                  )}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Customer:</span>{' '}
                {selectedTransaction.customer_phone ||
                  selectedTransaction.customer_email ||
                  'Unknown'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              disabled={refunding}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={refunding}
            >
              {refunding ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionHistory;
