'use client';

import { useState } from 'react';
import {
  type WhatsAppOrder,
  formatCurrency,
  type SupportedCurrency,
} from '@/types/ecommerce';
import {
  type PaymentProvider,
  PAYMENT_PROVIDERS,
  getProvidersForCurrency,
} from '@/types/payments';
import { getRecommendedProviders } from '@/lib/payment-market-map';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';

interface IncomingOrderCardProps {
  order: WhatsAppOrder;
  onConfirm: (orderId: string) => void;
  onSendPaymentLink: (orderId: string, provider: PaymentProvider) => void;
  onDismiss: (orderId: string) => void;
  className?: string;
}

export function IncomingOrderCard({
  order,
  onConfirm,
  onSendPaymentLink,
  onDismiss,
  className,
}: IncomingOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sending, setSending] = useState(false);

  const recommendedProviders = getRecommendedProviders(
    order.customer_phone,
    order.currency
  );
  const currencyProviders = getProvidersForCurrency(order.currency);
  const bestProvider = recommendedProviders[0] ?? currencyProviders[0] ?? 'paystack';
  const providerInfo = PAYMENT_PROVIDERS[bestProvider];

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Pulsing left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 animate-pulse bg-gradient-to-b from-blue-500 to-emerald-500" />

      <div className="pl-4 pr-3 py-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-blue-600 hover:bg-blue-600 text-white gap-1 text-xs"
            >
              <Bell className="h-3 w-3" />
              New Order
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <button
            onClick={() => onDismiss(order.id)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Customer info */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {order.customer_name || 'Customer'}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {order.customer_phone}
          </span>
        </div>

        {/* Summary */}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingCart className="h-3.5 w-3.5" />
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span className="font-semibold">
            {formatCurrency(order.total_amount, order.currency as SupportedCurrency)}
          </span>
        </div>

        {/* Expandable items list */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide order items' : 'Show order items'}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Hide items
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show items
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-1.5 rounded-md bg-muted/50 p-2">
            {order.items.map((item, idx) => (
              <div
                key={`${item.product_retailer_id}-${idx}`}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate mr-2">
                  {item.name}{' '}
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatCurrency(item.unit_price, item.currency as SupportedCurrency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recommended provider */}
        <div className="mt-2 text-xs text-muted-foreground">
          Recommended: <span className="font-medium text-foreground">{providerInfo.name}</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={async () => {
              setSending(true);
              try {
                await onSendPaymentLink(order.id, bestProvider);
              } finally {
                setSending(false);
              }
            }}
            disabled={sending}
          >
            {sending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            Confirm & Send Payment Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => onConfirm(order.id)}
          >
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}
