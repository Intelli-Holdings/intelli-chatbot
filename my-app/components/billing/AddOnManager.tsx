"use client";

import { useEffect, useState } from "react";
import { BillingService } from "@/services/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";
import type { AddOn, SubscriptionAddOn } from "@/types/billing";

interface AddOnManagerProps {
  organizationId: string;
  currentAddOns: SubscriptionAddOn[];
  onUpdate: () => void;
}

export function AddOnManager({ organizationId, currentAddOns, onUpdate }: AddOnManagerProps) {
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    BillingService.getAddOns()
      .then(setAddons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAttached = (addonId: string) =>
    currentAddOns.some((a) => a.addon.id === addonId && a.is_active);

  const handleToggle = async (addon: AddOn) => {
    setActionLoading(addon.id);
    try {
      const attached = isAttached(addon.id);
      await BillingService.manageAddOns(
        organizationId,
        addon.id,
        attached ? "remove" : "add",
        1
      );
      toast.success(attached ? `Removed ${addon.name}` : `Added ${addon.name}`);
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update add-on");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {addons.map((addon) => {
        const attached = isAttached(addon.id);
        return (
          <div
            key={addon.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              attached ? "border-primary/30 bg-primary/5" : "border-border"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{addon.name}</p>
              <p className="text-xs text-muted-foreground">
                ${addon.unit_price} {addon.unit_label}
              </p>
            </div>
            <Button
              variant={attached ? "outline" : "default"}
              size="sm"
              disabled={actionLoading === addon.id}
              onClick={() => handleToggle(addon)}
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
          </div>
        );
      })}
    </div>
  );
}
