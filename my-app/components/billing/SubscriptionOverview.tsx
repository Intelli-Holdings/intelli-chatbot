"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubscriptionState } from "@/types/billing";

interface SubscriptionOverviewProps {
  subscription: SubscriptionState | null;
  loading: boolean;
  onChangePlan: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  highlighted?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  trialing: "bg-blue-50 text-blue-700 border-blue-200",
  past_due: "bg-amber-50 text-amber-700 border-amber-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

export function SubscriptionOverview({
  subscription,
  loading,
  onChangePlan,
  onCancel,
  onReactivate,
  highlighted,
}: SubscriptionOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
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
        <CardHeader>
          <CardTitle className="text-base font-semibold">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active subscription. Start a 7-day free trial — no credit card required.
          </p>
          <Button onClick={onChangePlan} className="mt-4" size="sm">
            Start Free Trial
          </Button>
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
  const intervalLabel = billing_interval === "yearly" ? "year" : "month";

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
          <CardTitle className="text-base font-semibold">Subscription</CardTitle>
          <Badge variant="outline" className={STATUS_STYLES[status] || ""}>
            {is_complimentary ? "Complimentary" : status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Billing breakdown */}
        {!is_complimentary ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{plan.name}</span>
              <span>${planPrice.toFixed(2)}/{intervalLabel}</span>
            </div>
            {activeAddOns.map((sub_addon) => (
              <div
                key={sub_addon.id}
                className={`flex justify-between text-xs ${
                  sub_addon.cancel_at_period_end
                    ? "text-muted-foreground/50 line-through"
                    : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {sub_addon.addon.name}
                  {sub_addon.quantity > 1 && ` x${sub_addon.quantity}`}
                  {sub_addon.cancel_at_period_end && (
                    <span className="no-underline text-[10px] font-medium text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                      Cancels {current_period_end ? new Date(current_period_end).toLocaleDateString() : "at period end"}
                    </span>
                  )}
                </span>
                <span>
                  ${(parseFloat(sub_addon.addon.unit_price) * sub_addon.quantity).toFixed(2)}/{intervalLabel}
                </span>
              </div>
            ))}
            {activeAddOns.length > 0 && (
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}/{intervalLabel}</span>
              </div>
            )}
            {cancellingAddOns.length > 0 && renewingTotal !== totalPrice && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>After removals</span>
                <span>${renewingTotal.toFixed(2)}/{intervalLabel}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium">{plan.name}</p>
            <p className="text-xs text-muted-foreground">
              {complimentary_reason || "Complimentary access"}
            </p>
          </div>
        )}

        {!is_complimentary && current_period_end && (
          <div className="text-xs text-muted-foreground">
            {cancel_at_period_end
              ? `Cancels on ${new Date(current_period_end).toLocaleDateString()}`
              : status === "trialing" && days_until_renewal !== null
                ? `Trial ends in ${days_until_renewal} days — first payment on ${new Date(current_period_end).toLocaleDateString()}`
                : days_until_renewal !== null
                  ? `Next payment on ${new Date(current_period_end).toLocaleDateString()} (${days_until_renewal} days)`
                  : `Current period ends ${new Date(current_period_end).toLocaleDateString()}`
            }
          </div>
        )}

        {/* Credits meter */}
        {subscription.credits && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>AI Credits</span>
              <span>
                {subscription.credits.credits_used.toLocaleString()} / {subscription.credits.credits_total.toLocaleString()}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, subscription.credits.usage_percentage)}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {!is_complimentary && (
          <div className="flex gap-2 pt-2">
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onCancel}>
                    Cancel
                  </Button>
                ) : null}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
