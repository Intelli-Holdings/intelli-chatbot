"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { BillingService } from "@/services/billing";
import { SubscriptionOverview } from "@/components/billing/SubscriptionOverview";
import { CreditUsage } from "@/components/billing/CreditUsage";
import { TransactionHistory } from "@/components/billing/TransactionHistory";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { AddOnManager } from "@/components/billing/AddOnManager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function BillingPage() {
  const organizationId = useActiveOrganizationId();
  const { subscription, loading: subLoading, refetch } = useSubscription();

  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCancel = async () => {
    if (!organizationId) return;
    try {
      await BillingService.cancelSubscription(organizationId);
      toast.success("Subscription will cancel at end of billing period");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
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
      toast.error(error instanceof Error ? error.message : "Failed to open payment portal");
      setPortalLoading(false);
    }
  };

  const hasActiveStripe =
    subscription?.payment_provider === "stripe" &&
    (subscription?.status === "active" || subscription?.status === "trialing");

  return (
    <div className="w-full">
      <main className="flex-1 bg-white p-6 ml-4">
        <h1 className="text-2xl font-semibold mb-6">Billing</h1>

        <div className="space-y-6 max-w-3xl">
          {/* Subscription overview */}
          <SubscriptionOverview
            subscription={subscription}
            loading={subLoading}
            onChangePlan={() => setIsPlanSelectorOpen(true)}
            onCancel={handleCancel}
            onReactivate={handleReactivate}
          />

          {subscription?.credits && (
            <CreditUsage credits={subscription.credits} loading={subLoading} />
          )}

          {/* Tabs: Add-ons, History, Invoices */}
          <Tabs defaultValue="addons">
            <TabsList>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="addons">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-ons</CardTitle>
                  <CardDescription>Extend your plan with additional features.</CardDescription>
                </CardHeader>
                <CardContent>
                  {organizationId && (
                    <AddOnManager
                      organizationId={organizationId}
                      currentAddOns={subscription?.addons || []}
                      onUpdate={refetch}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transaction History</CardTitle>
                  <CardDescription>Recent payments and charges.</CardDescription>
                </CardHeader>
                <CardContent>
                  {organizationId && <TransactionHistory organizationId={organizationId} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Invoices</CardTitle>
                  <CardDescription>Download and manage your invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                  {organizationId && <InvoiceList organizationId={organizationId} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
        </div>

        {/* Plan selector modal */}
        {organizationId && (
          <PlanSelector
            open={isPlanSelectorOpen}
            onClose={() => setIsPlanSelectorOpen(false)}
            currentPlanId={subscription?.plan?.id}
            organizationId={organizationId}
            hasActiveStripeSubscription={!!hasActiveStripe}
          />
        )}
      </main>
    </div>
  );
}
