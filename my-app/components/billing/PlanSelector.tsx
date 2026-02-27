"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BillingService } from "@/services/billing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Plan, BillingInterval } from "@/types/billing";

interface PlanSelectorProps {
  open: boolean;
  onClose: () => void;
  currentPlanId?: string;
  organizationId: string;
  /** True if the org has an active Stripe subscription that can be modified */
  hasActiveStripeSubscription?: boolean;
}

export function PlanSelector({ open, onClose, currentPlanId, organizationId, hasActiveStripeSubscription }: PlanSelectorProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.intelliconcierge.com";
    console.log("[PlanSelector] Fetching plans from:", `${API_BASE}/subscriptions/plans/`);

    BillingService.getPlans()
      .then((data) => {
        console.log("[PlanSelector] Loaded plans:", data.length, data);
        setPlans(data);
      })
      .catch((err) => {
        console.error("[PlanSelector] Failed to load plans:", err);
        setError(err.message || "Failed to load plans");
      })
      .finally(() => setLoading(false));
  }, [open]);

  const [actionLoading, setActionLoading] = useState(false);

  const handleStartTrial = async (plan: Plan) => {
    if (!organizationId) return;
    setActionLoading(true);
    try {
      await BillingService.startTrial(organizationId, plan.id, interval);
      toast.success(`7-day free trial started on ${plan.name}`);
      onClose();
      window.location.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start trial";
      if (msg.includes("already used")) {
        // Trial already used — go to checkout instead
        router.push(`/checkout?plan=${plan.slug}&interval=${interval}`);
        onClose();
      } else {
        toast.error(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async (plan: Plan) => {
    if (!organizationId) return;
    try {
      await BillingService.changePlan(organizationId, plan.id, interval);
      onClose();
      window.location.reload();
    } catch {
      // Error handled by service
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a plan</DialogTitle>
          <DialogDescription>Select a plan that fits your needs.</DialogDescription>
        </DialogHeader>

        {/* Interval toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={interval === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setInterval("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={interval === "yearly" ? "default" : "outline"}
            size="sm"
            onClick={() => setInterval("yearly")}
          >
            Yearly (save 2 months)
          </Button>
        </div>

        {/* Plan list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading && (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading plans...</p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500 py-4 text-center">{error}</p>
          )}
          {!loading && !error && plans.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No plans available.</p>
          )}
          {plans.filter(p => p.category !== "enterprise").map((plan) => {
            const price = interval === "yearly" ? plan.yearly_price : plan.monthly_price;
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                key={plan.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isCurrent ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{plan.name}</span>
                    {plan.is_popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.max_contacts.toLocaleString()} contacts, {plan.monthly_ai_credits.toLocaleString()} AI credits/mo
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ${price}/{interval === "yearly" ? "yr" : "mo"}
                  </span>
                  {isCurrent && hasActiveStripeSubscription ? (
                    <Button variant="outline" size="sm" disabled>
                      Current
                    </Button>
                  ) : hasActiveStripeSubscription ? (
                    <Button variant="outline" size="sm" onClick={() => handleChangePlan(plan)}>
                      Switch
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleStartTrial(plan)} disabled={actionLoading}>
                      {actionLoading ? "Starting..." : "Start Free Trial"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
