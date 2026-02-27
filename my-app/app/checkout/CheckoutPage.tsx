"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { BillingService } from "@/services/billing";
import { MpesaPayment } from "@/components/billing/MpesaPayment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan, BillingInterval } from "@/types/billing";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";

type PaymentMethod = "stripe" | "mpesa";

export function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const organizationId = useActiveOrganizationId();

  const planSlug = searchParams.get("plan") || "";
  const interval = (searchParams.get("interval") || "monthly") as BillingInterval;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await BillingService.getPlans();
        setPlans(data);
        const match = data.find((p) => p.slug === planSlug);
        if (match) setSelectedPlan(match);
      } catch {
        // Plans will show as empty
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [planSlug]);

  const price = selectedPlan
    ? interval === "yearly"
      ? selectedPlan.yearly_price
      : selectedPlan.monthly_price
    : "0";

  const handleStripeCheckout = async () => {
    if (!organizationId || !selectedPlan) return;
    setCheckoutLoading(true);
    try {
      const result = await BillingService.createStripeCheckout(organizationId, {
        plan_id: selectedPlan.id,
        billing_interval: interval,
        success_url: `${window.location.origin}/dashboard/billing?checkout=success`,
        cancel_url: `${window.location.origin}/checkout?plan=${planSlug}&interval=${interval}`,
      });
      window.location.href = result.checkout_url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-lg space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Plan not found.</p>
          <Button variant="outline" onClick={() => router.push("/pricing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>

        {/* Plan summary */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold">Subscribe to {selectedPlan.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ${price}/{interval === "yearly" ? "year" : "month"}
          </p>
        </div>

        {/* Payment method selector */}
        <div className="space-y-3 mb-8">
          <p className="text-sm font-medium">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("stripe")}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                paymentMethod === "stripe"
                  ? "border-foreground bg-muted/50"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card / Google Pay
            </button>
            <button
              onClick={() => setPaymentMethod("mpesa")}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                paymentMethod === "mpesa"
                  ? "border-foreground bg-muted/50"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              M-Pesa
            </button>
          </div>
        </div>

        {/* Payment form */}
        {paymentMethod === "stripe" ? (
          <div className="space-y-4">
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedPlan.name}</span>
                  <span>${price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="capitalize">{interval}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${price}/{interval === "yearly" ? "yr" : "mo"}</span>
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleStripeCheckout}
              disabled={checkoutLoading || !organizationId}
              className="w-full"
            >
              {checkoutLoading ? "Redirecting..." : "Continue to payment"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll be redirected to Stripe&apos;s secure checkout. 7-day free trial included.
            </p>
          </div>
        ) : (
          <MpesaPayment
            plan={selectedPlan}
            billingInterval={interval}
            organizationId={organizationId || ""}
          />
        )}
      </div>
    </div>
  );
}
