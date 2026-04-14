'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Package,
  Truck,
  XCircle,
  Send,
  MessageSquare,
  MapPin,
  Phone,
  User,
  CreditCard,
  FileText,
  AlertCircle,
  RefreshCw,
  ArrowRightLeft,
} from 'lucide-react';
import { useOrder } from '@/hooks/use-orders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types/ecommerce';
import { formatCurrency, type SupportedCurrency } from '@/types/ecommerce';
import {
  type PaymentProvider,
  PAYMENT_PROVIDERS,
  getProvidersForCurrency,
} from '@/types/payments';

// -----------------------------------------------------------------------------
// Status configuration (same pattern as orders list page)
// -----------------------------------------------------------------------------

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
  }
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

const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled', 'refunded'];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const {
    order,
    loading,
    error,
    refetch,
    updateStatus,
    sendPaymentLink,
    sendConfirmation,
    cancelOrder,
    saving,
  } = useOrder(orderId);

  // Copy ID state
  const [copied, setCopied] = useState(false);

  // Dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Form state
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | ''>('');
  const [cancelReason, setCancelReason] = useState('');

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleUpdateStatus = async () => {
    try {
      await updateStatus(newStatus, statusNotes || undefined);
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
      setStatusDialogOpen(false);
      setStatusNotes('');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const handleSendPaymentLink = async () => {
    if (!selectedProvider) return;

    try {
      await sendPaymentLink(selectedProvider);
      toast.success('Payment link sent successfully');
      setPaymentDialogOpen(false);
      setSelectedProvider('');
    } catch {
      toast.error('Failed to send payment link');
    }
  };

  const handleSendConfirmation = async () => {
    try {
      await sendConfirmation();
      toast.success('Confirmation sent to customer');
    } catch {
      toast.error('Failed to send confirmation');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(cancelReason || 'Cancelled by agent');
      toast.success('Order cancelled');
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const openStatusDialog = () => {
    if (!order) return;
    setNewStatus(order.status === 'pending' ? 'confirmed' : 'shipped');
    setStatusNotes('');
    setStatusDialogOpen(true);
  };

  const openPaymentDialog = () => {
    setSelectedProvider('');
    setPaymentDialogOpen(true);
  };

  const openCancelDialog = () => {
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error || !order) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/commerce/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Order Not Found</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'The order you are looking for could not be found.'}
          </AlertDescription>
        </Alert>
        <div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;
  const isTerminal = TERMINAL_STATUSES.includes(order.status);
  const currency = order.currency as SupportedCurrency;
  const availableProviders = getProvidersForCurrency(order.currency);

  // ---------------------------------------------------------------------------
  // Timeline
  // ---------------------------------------------------------------------------

  const standardProgression: OrderStatus[] = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered'];
  const currentIndex = standardProgression.indexOf(order.status);

  const timelineSteps: { status: OrderStatus; label: string; state: 'completed' | 'current' | 'upcoming' | 'cancelled'; date?: string }[] =
    standardProgression.map((status, i) => {
      const label = statusConfig[status].label;
      if (currentIndex === -1) {
        // Status is cancelled/refunded — mark everything before it as completed based on what makes sense
        return { status, label, state: 'upcoming' as const };
      }
      if (i < currentIndex) {
        return { status, label, state: 'completed' as const, date: i === 0 ? order.created_at : undefined };
      }
      if (i === currentIndex) {
        return { status, label, state: 'current' as const, date: currentIndex === 0 ? order.created_at : order.updated_at };
      }
      return { status, label, state: 'upcoming' as const };
    });

  // If cancelled or refunded, mark all steps up to where the order was as completed,
  // then add the terminal status
  if (order.status === 'cancelled' || order.status === 'refunded') {
    // Try to infer how far the order got — we can't know for sure, so mark first step completed
    timelineSteps[0] = { ...timelineSteps[0], state: 'completed', date: order.created_at };
    timelineSteps.push({
      status: order.status,
      label: statusConfig[order.status].label,
      state: 'cancelled',
      date: order.updated_at,
    });
    // Remove upcoming steps after the terminal one isn't needed, but we keep them dimmed
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top section: Back button, heading, status, date */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/commerce/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">
            Order #{order.id.slice(0, 8)}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              navigator.clipboard.writeText(order.id);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            title="Copy order ID"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Badge variant={statusInfo.variant} className="text-sm">
            <StatusIcon className="mr-1 h-3.5 w-3.5" />
            {statusInfo.label}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          Created {format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
        </span>
      </div>

      {/* Action buttons */}
      {!isTerminal && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openStatusDialog} disabled={saving}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Update Status
          </Button>
          <Button variant="outline" onClick={openPaymentDialog} disabled={saving}>
            <CreditCard className="mr-2 h-4 w-4" />
            Send Payment Link
          </Button>
          <Button variant="outline" onClick={handleSendConfirmation} disabled={saving}>
            <Send className="mr-2 h-4 w-4" />
            Send Confirmation
          </Button>
          <Button
            variant="destructive"
            onClick={openCancelDialog}
            disabled={saving}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Order
          </Button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length !== 1 && 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-center font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr
                        key={index}
                        className={cn(
                          'border-b last:border-b-0',
                          index % 2 === 0 ? '' : 'bg-muted/25'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.product_retailer_id}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(item.unit_price, currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.unit_price * item.quantity, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={3} className="px-4 py-3 text-right text-muted-foreground">
                        Subtotal
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(order.subtotal, currency)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-base">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-base">
                        {formatCurrency(order.total_amount, currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {order.customer_name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer_phone}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <Link href="/dashboard/conversations/whatsapp">
                    <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                  </Link>
                </Button>
              </div>

              {order.shipping_address && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p>{order.shipping_address.address_line1}</p>
                      {order.shipping_address.address_line2 && (
                        <p>{order.shipping_address.address_line2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}
                        {order.shipping_address.state && `, ${order.shipping_address.state}`}
                        {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      {order.shipping_address.phone && (
                        <p className="text-muted-foreground">
                          {order.shipping_address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payment_provider ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Provider</span>
                    <Badge variant="outline">
                      {PAYMENT_PROVIDERS[order.payment_provider as PaymentProvider]?.name ||
                        order.payment_provider}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium capitalize">
                      {order.payment_status || 'Unknown'}
                    </span>
                  </div>
                  {order.payment_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment ID</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {order.payment_id}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2 space-y-3">
                  <p className="text-sm text-muted-foreground">No payment recorded</p>
                  {!isTerminal && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={openPaymentDialog}
                      disabled={saving}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      Send Payment Link
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timelineSteps.map((step, index) => (
                  <div key={step.status} className="flex gap-3">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'h-3 w-3 rounded-full border-2 shrink-0',
                        step.state === 'completed' && 'bg-green-500 border-green-500',
                        step.state === 'current' && 'bg-blue-500 border-blue-500 animate-pulse',
                        step.state === 'upcoming' && 'bg-transparent border-muted-foreground/30',
                        step.state === 'cancelled' && 'bg-red-500 border-red-500',
                      )} />
                      {index < timelineSteps.length - 1 && (
                        <div className={cn(
                          'w-0.5 flex-1 min-h-[24px]',
                          step.state === 'completed' ? 'bg-green-500' : 'bg-muted-foreground/20',
                          step.state === 'upcoming' && 'border-l border-dashed border-muted-foreground/20 w-0',
                        )} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-4">
                      <p className={cn(
                        'text-sm font-medium',
                        step.state === 'upcoming' && 'text-muted-foreground/50',
                        step.state === 'cancelled' && 'text-red-600',
                      )}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(step.date), 'MMM d, yyyy · h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Dialogs                                                             */}
      {/* ================================================================== */}

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{order.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
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
            <div className="space-y-2">
              <label htmlFor="status-notes" className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                id="status-notes"
                placeholder="Add a note about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
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

      {/* Send Payment Link Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Link</DialogTitle>
            <DialogDescription>
              Choose a payment provider to send a payment link to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Provider</label>
              {availableProviders.length > 0 ? (
                <Select
                  value={selectedProvider}
                  onValueChange={(v) => setSelectedProvider(v as PaymentProvider)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((providerId) => {
                      const provider = PAYMENT_PROVIDERS[providerId];
                      return (
                        <SelectItem key={providerId} value={providerId}>
                          {provider.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment providers available for {order.currency}.
                </p>
              )}
            </div>

            {selectedProvider && (
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium">
                  {PAYMENT_PROVIDERS[selectedProvider].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PAYMENT_PROVIDERS[selectedProvider].description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {PAYMENT_PROVIDERS[selectedProvider].payment_methods.map(
                    (method) => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendPaymentLink}
              disabled={saving || !selectedProvider}
            >
              {saving ? 'Sending...' : 'Send Payment Link'}
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
          <div className="space-y-2 py-4">
            <label htmlFor="cancel-reason" className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              id="cancel-reason"
              placeholder="Provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
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
