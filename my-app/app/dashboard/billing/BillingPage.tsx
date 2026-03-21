"use client";

import { useCallback, useRef, useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { BillingService } from "@/services/billing";
import { SubscriptionOverview } from "@/components/billing/SubscriptionOverview";
import { CreditUsage } from "@/components/billing/CreditUsage";
import { PaymentMethod } from "@/components/billing/PaymentMethod";
import { TransactionHistory } from "@/components/billing/TransactionHistory";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { AddOnManager } from "@/components/billing/AddOnManager";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BillingPage() {
  const organizationId = useActiveOrganizationId();
  const { subscription, loading: subLoading, refetch } = useSubscription();

  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const [highlightOverview, setHighlightOverview] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);

  const handleAddOnChange = useCallback(async () => {
    await refetch();
    overviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightOverview(true);
    setTimeout(() => setHighlightOverview(false), 1800);
  }, [refetch]);

  const handleCancel = async () => {
    if (!organizationId) return;
    setIsCancelling(true);
    try {
      await BillingService.cancelSubscription(organizationId);
      toast.success("Subscription will cancel at end of billing period");
      setCancelDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!organizationId) return;
    try {
      await BillingService.reactivateSubscription(organizationId);
      toast.success("Subscription reactivated");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate");
    }
  };

  const showPaymentMethod = !!subscription?.stripe_customer_id;

  const isPastDue = subscription?.status === "past_due";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Past-due warning banner */}
      {isPastDue && (
        <Alert variant="destructive" className="mb-6 border-amber-300 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 !text-amber-600" />
          <AlertDescription>
            Your last payment failed. Please update your payment method to avoid
            service interruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription, add-ons, and payment methods.
        </p>
      </div>

      {/* Two-column grid: left = plan + credits + addons, right = payment */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Left column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan summary */}
          <div ref={overviewRef}>
            <SubscriptionOverview
              subscription={subscription}
              loading={subLoading}
              onChangePlan={() => setIsPlanSelectorOpen(true)}
              onCancel={() => setCancelDialogOpen(true)}
              onReactivate={handleReactivate}
              highlighted={highlightOverview}
              organizationId={organizationId ?? undefined}
            />
          </div>

          {/* AI Credits */}
          {subscription?.credits && (
            <CreditUsage credits={subscription.credits} loading={subLoading} />
          )}

          {/* Add-ons section */}
          <Card>
            <CardHeader className="pb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Add-ons
              </span>
            </CardHeader>
            <CardContent>
              {organizationId && (
                <AddOnManager
                  organizationId={organizationId}
                  currentAddOns={subscription?.addons || []}
                  onUpdate={handleAddOnChange}
                  subscriptionStatus={subscription?.status}
                  paymentProvider={subscription?.payment_provider}
                  checkoutUrl={
                    subscription?.plan
                      ? `/checkout?plan=${subscription.plan.slug}&interval=${subscription.billing_interval}${
                          subscription.addons
                            ?.filter((a) => a.is_active)
                            .map((a) => `&addon=${a.addon.id}`)
                            .join("") || ""
                        }`
                      : undefined
                  }
                  periodEnd={subscription?.current_period_end}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          {/* Payment method — uses Stripe API directly, no portal redirect */}
          {showPaymentMethod && (
            <PaymentMethod
              stripeCustomerId={subscription?.stripe_customer_id ?? null}
              isPastDue={isPastDue}
            />
          )}
        </div>
      </div>

      {/* Invoices & History — full width below the grid */}
      <div className="mt-6">
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Invoices
                </span>
              </CardHeader>
              <CardContent>
                {organizationId && <InvoiceList organizationId={organizationId} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Transaction History
                </span>
              </CardHeader>
              <CardContent>
                {organizationId && <TransactionHistory organizationId={organizationId} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Plan selector modal */}
      {organizationId && (
        <PlanSelector
          open={isPlanSelectorOpen}
          onClose={() => setIsPlanSelectorOpen(false)}
          currentPlanId={subscription?.plan?.id}
          organizationId={organizationId}
          hasActiveStripeSubscription={!!showPaymentMethod}
          onPlanChanged={refetch}
        />
      )}

      {/* Cancel confirmation dialog */}
      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => !open && setCancelDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of the current
              billing period
              {subscription?.current_period_end
                ? ` (${new Date(subscription.current_period_end).toLocaleDateString()})`
                : ""}
              . After that, you will lose access to paid features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep subscription
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
