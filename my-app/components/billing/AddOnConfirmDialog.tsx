"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Minus, Plus } from "lucide-react";
import type { AddOn } from "@/types/billing";

// ---------------------------------------------------------------------------
// Add Dialog
// ---------------------------------------------------------------------------

interface AddOnAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddOn | null;
  onConfirm: (addonId: string, quantity: number) => Promise<void>;
  /** True when user has an active payment method (Stripe subscription) */
  hasActivePayment?: boolean;
}

export function AddOnAddDialog({
  open,
  onOpenChange,
  addon,
  onConfirm,
  hasActivePayment,
}: AddOnAddDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!addon) return null;

  const unitPrice = parseFloat(addon.unit_price);
  const total = (unitPrice * quantity).toFixed(2);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(addon.id, quantity);
      onOpenChange(false);
    } catch {
      // Error toast handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {addon.name}</DialogTitle>
          <DialogDescription>{addon.description}</DialogDescription>
        </DialogHeader>

        {addon.addon_type !== "webhook" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSubmitting}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 h-8 text-center [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={isSubmitting}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                  disabled={quantity >= 100 || isSubmitting}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ${addon.unit_price} &times; {quantity}
                </span>
                <span className="font-medium">
                  ${total} {addon.unit_label}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm">
              <span className="font-medium">${addon.unit_price}</span>
              <span className="text-muted-foreground">
                {" "}
                {addon.unit_label} will be added to your bill.
              </span>
            </p>
          </div>
        )}

        {hasActivePayment && (
          <p className="text-xs text-muted-foreground">
            Your card on file will be charged automatically. The amount is
            prorated for the remainder of your current billing period.
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : hasActivePayment ? (
              "Confirm & pay"
            ) : (
              "Add to subscription"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Remove Dialog
// ---------------------------------------------------------------------------

interface AddOnRemoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddOn | null;
  onConfirm: (addonId: string) => Promise<void>;
}

export function AddOnRemoveDialog({
  open,
  onOpenChange,
  addon,
  onConfirm,
}: AddOnRemoveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setIsSubmitting(false);
  }, [open]);

  if (!addon) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(addon.id);
      onOpenChange(false);
    } catch {
      // Error toast handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {addon.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This add-on will be removed at the end of your current billing
            period. You can re-add it at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
