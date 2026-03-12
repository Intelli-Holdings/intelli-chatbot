"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { BillingService } from "@/services/billing";
import { toast } from "sonner";
import type { SubscriptionState } from "@/types/billing";

interface SubscriptionOverviewProps {
  subscription: SubscriptionState | null;
  loading: boolean;
  onChangePlan: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  highlighted?: boolean;
  organizationId?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  trialing: { label: "Trial", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  past_due: { label: "Past due", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  canceled: { label: "Canceled", className: "bg-red-500/10 text-red-600 border-red-200" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
};

export function SubscriptionOverview({
  subscription,
  loading,
  onChangePlan,
  onCancel,
  onReactivate,
  highlighted,
  organizationId,
}: SubscriptionOverviewProps) {
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManagePayment = async () => {
    if (!organizationId) return;
    setPortalLoading(true);
    try {
      const portalUrl = await BillingService.openCustomerPortal(
        organizationId,
        window.location.href
      );
      window.location.href = portalUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  const hasActiveStripe =
    subscription?.payment_provider === "stripe" &&
    (subscription?.status === "active" || subscription?.status === "trialing");

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.plan) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto max-w-sm space-y-3">
            <p className="text-sm font-medium">No active subscription</p>
            <p className="text-sm text-muted-foreground">
              Start a 7-day free trial — no credit card required.
            </p>
            <Button onClick={onChangePlan} size="sm">
              Start Free Trial
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { plan, status, billing_interval, current_period_end, cancel_at_period_end, is_complimentary, complimentary_reason, days_until_renewal, addons } = subscription;

  const activeAddOns = addons?.filter((a) => a.is_active) || [];
  const renewingAddOns = activeAddOns.filter((a) => !a.cancel_at_period_end);
  const cancellingAddOns = activeAddOns.filter((a) => a.cancel_at_period_end);
  const planPrice = parseFloat(
    billing_interval === "yearly" ? plan.yearly_price : plan.monthly_price
  );
  const addOnTotal = activeAddOns.reduce(
    (sum, a) => sum + parseFloat(a.addon.unit_price) * a.quantity,
    0
  );
  const renewingTotal = planPrice + renewingAddOns.reduce(
    (sum, a) => sum + parseFloat(a.addon.unit_price) * a.quantity,
    0
  );
  const totalPrice = planPrice + addOnTotal;
  const intervalLabel = billing_interval === "yearly" ? "yr" : "mo";
  const statusConfig = STATUS_CONFIG[status] || { label: status, className: "" };

  return (
    <Card
      className={
        highlighted
          ? "animate-[highlight-pulse_1.5s_ease-in-out] ring-2 ring-primary/40"
          : ""
      }
      style={
        highlighted
          ? { animation: "highlight-pulse 1.5s ease-in-out forwards" }
          : undefined
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Plan
          </span>
          <Badge variant="outline" className={statusConfig.className}>
            {is_complimentary ? "Complimentary" : statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Plan name + price hero */}
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          {!is_complimentary && (
            <div className="text-right">
              <span className="text-2xl font-bold tabular-nums">
                ${totalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">/{intervalLabel}</span>
            </div>
          )}
        </div>

        {/* Cost breakdown */}
        {!is_complimentary ? (
          <div className="space-y-2">
            <Separator />
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base plan</span>
                <span className="tabular-nums">${planPrice.toFixed(2)}</span>
              </div>
              {activeAddOns.map((sub_addon) => (
                <div
                  key={sub_addon.id}
                  className={`flex justify-between text-sm ${
                    sub_addon.cancel_at_period_end
                      ? "text-muted-foreground/50 line-through"
                      : ""
                  }`}
                >
                  <span className="text-muted-foreground">
                    {sub_addon.addon.name}
                    {sub_addon.quantity > 1 && ` (x${sub_addon.quantity})`}
                  </span>
                  <span className="tabular-nums">
                    ${(parseFloat(sub_addon.addon.unit_price) * sub_addon.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {cancellingAddOns.length > 0 && renewingTotal !== totalPrice && (
              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-dashed">
                <span>After pending removals</span>
                <span className="tabular-nums">${renewingTotal.toFixed(2)}/{intervalLabel}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">
              {complimentary_reason || "Complimentary access"}
            </p>
          </div>
        )}

        {/* Billing cycle info */}
        {!is_complimentary && current_period_end && (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {cancel_at_period_end
                ? `Cancels ${new Date(current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : status === "trialing" && days_until_renewal !== null
                  ? `Trial ends in ${days_until_renewal} days · First payment ${new Date(current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : days_until_renewal !== null
                    ? `Next invoice ${new Date(current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${days_until_renewal} days`
                    : `Period ends ${new Date(current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              }
            </span>
          </div>
        )}

        {/* Actions */}
        {!is_complimentary && (
          <div className="flex gap-2">
            {status === "expired" || status === "canceled" ? (
              <Button size="sm" onClick={onChangePlan}>
                Subscribe
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onChangePlan}>
                  Change plan
                </Button>
                {cancel_at_period_end ? (
                  <Button variant="outline" size="sm" onClick={onReactivate}>
                    Reactivate
                  </Button>
                ) : status === "active" || status === "trialing" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Manage payment method via Stripe Portal */}
        {hasActiveStripe && (
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="text-sm font-medium">Payment method</p>
              <p className="text-xs text-muted-foreground">
                Update your card or billing details via Stripe
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManagePayment}
              disabled={portalLoading}
            >
              {portalLoading ? "Opening..." : "Manage"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
