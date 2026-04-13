"use client";

import { useState } from "react";
import { BillingService } from "@/services/billing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, RefreshCw, ArrowRight } from "lucide-react";
import type { AddOn, SubscriptionAddOn, SubscriptionStatus, PaymentProvider } from "@/types/billing";
import { useAddOnCatalog } from "@/hooks/use-addon-catalog";
import {
  AddOnAddDialog,
  AddOnRemoveDialog,
} from "@/components/billing/AddOnConfirmDialog";

interface AddOnManagerProps {
  organizationId: string;
  currentAddOns: SubscriptionAddOn[];
  onUpdate: () => void | Promise<void>;
  subscriptionStatus?: SubscriptionStatus;
  paymentProvider?: PaymentProvider | "";
  checkoutUrl?: string;
  periodEnd?: string | null;
}

export function AddOnManager({ organizationId, currentAddOns, onUpdate, subscriptionStatus, paymentProvider, checkoutUrl, periodEnd }: AddOnManagerProps) {
  const { addons, loading, error: addonsError, refetch: refetchAddOns } = useAddOnCatalog();
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddOn | null>(null);

  const getSubscriptionAddon = (addonId: string) =>
    currentAddOns.find((a) => a.addon.id === addonId && a.is_active);

  const isAttached = (addonId: string) => !!getSubscriptionAddon(addonId);

  const isPendingRemoval = (addonId: string) => {
    const sub = getSubscriptionAddon(addonId);
    return sub?.cancel_at_period_end ?? false;
  };

  const getAttachedQuantity = (addonId: string) => {
    const sub = getSubscriptionAddon(addonId);
    return sub?.quantity ?? 0;
  };

  const handleAddClick = (addon: AddOn) => {
    setSelectedAddon(addon);
    setAddDialogOpen(true);
  };

  const handleRemoveClick = (addon: AddOn) => {
    setSelectedAddon(addon);
    setRemoveDialogOpen(true);
  };

  const handleReactivate = async (addon: AddOn) => {
    setReactivatingId(addon.id);
    try {
      await BillingService.manageAddOns(organizationId, addon.id, "reactivate");
      toast.success(`${addon.name} will continue on your next billing period`);
      await onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate add-on");
    } finally {
      setReactivatingId(null);
    }
  };

  const handleConfirmAdd = async (addonId: string, quantity: number) => {
    try {
      await BillingService.manageAddOns(organizationId, addonId, "add", quantity);
      toast.success(`Added ${selectedAddon?.name}`);
      await onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add add-on");
      throw err;
    }
  };

  const handleConfirmRemove = async (addonId: string) => {
    try {
      await BillingService.manageAddOns(organizationId, addonId, "remove");
      toast.success(`${selectedAddon?.name} will be removed at end of billing period`);
      await onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove add-on");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (addonsError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">{addonsError}</p>
        <Button variant="outline" size="sm" onClick={refetchAddOns}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {addons.map((addon) => {
        const attached = isAttached(addon.id);
        const pendingRemoval = isPendingRemoval(addon.id);
        const qty = getAttachedQuantity(addon.id);
        return (
          <div
            key={addon.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              pendingRemoval
                ? "border-amber-200 bg-amber-50/30"
                : attached
                  ? "border-primary/20 bg-primary/[0.02]"
                  : "border-border hover:border-muted-foreground/20"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${pendingRemoval ? "text-muted-foreground" : ""}`}>
                  {addon.name}
                </p>
                {attached && !pendingRemoval && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    Active
                  </Badge>
                )}
                {pendingRemoval && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-200 text-amber-700 bg-amber-50">
                    Cancels {periodEnd ? new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "at period end"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                ${addon.unit_price} {addon.unit_label}
                {attached && addon.is_metered && qty > 1 && (
                  <span className="text-foreground font-medium"> · Qty: {qty}</span>
                )}
              </p>
            </div>
            {pendingRemoval ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => handleReactivate(addon)}
                disabled={reactivatingId === addon.id}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Keep
              </Button>
            ) : (
              <Button
                variant={attached ? "outline" : "default"}
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() =>
                  attached ? handleRemoveClick(addon) : handleAddClick(addon)
                }
              >
                {attached ? (
                  <>
                    <Minus className="h-3 w-3 mr-1" />
                    Remove
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}

      {subscriptionStatus === "trialing" && paymentProvider !== "stripe" && currentAddOns.some((a) => a.is_active) && checkoutUrl && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 mt-2">
          <div>
            <p className="text-sm font-medium">Ready to subscribe?</p>
            <p className="text-xs text-muted-foreground">
              End your trial and start your subscription with add-ons.
            </p>
          </div>
          <Button size="sm" className="h-7 text-xs" asChild>
            <a href={checkoutUrl}>
              Subscribe now
              <ArrowRight className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      )}

      <AddOnAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        addon={selectedAddon}
        onConfirm={handleConfirmAdd}
        hasActivePayment={paymentProvider === "stripe"}
      />
      <AddOnRemoveDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        addon={selectedAddon}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
