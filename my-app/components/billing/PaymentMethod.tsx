"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Trash2, Plus, MoreVertical, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePaymentCards } from "@/hooks/use-payment-cards";
import { formatCardBrand, formatExpiryDate } from "@/lib/stripe-utils";
import type { PaymentMethod as PaymentMethodType } from "@/types/billing";
import dynamic from "next/dynamic";

const StripePaymentModal = dynamic(
  () => import("@/components/modal/stripe-payment-modal"),
  { ssr: false }
);

interface PaymentMethodProps {
  stripeCustomerId: string | null;
  isPastDue?: boolean;
}

const WALLET_LABELS: Record<string, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  samsung_pay: "Samsung Pay",
  link: "Link",
};

export function PaymentMethod({ stripeCustomerId, isPastDue }: PaymentMethodProps) {
  const { cards, isLoading, removeCard, setDefaultCard, refreshCards } =
    usePaymentCards(stripeCustomerId);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<PaymentMethodType | null>(null);

  const handleRemove = async () => {
    if (!removeConfirm) return;
    const cardId = removeConfirm.id;
    setRemovingId(cardId);
    try {
      await removeCard(cardId);
      toast.success("Payment method removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
      setRemoveConfirm(null);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    setSettingDefaultId(cardId);
    try {
      await setDefaultCard(cardId);
      toast.success("Default payment method updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleAddSuccess = (_paymentMethod: unknown) => {
    setAddModalOpen(false);
    refreshCards();
    toast.success("Payment method added");
  };

  if (!stripeCustomerId) return null;

  return (
    <>
      <Card className={isPastDue ? "border-amber-300 shadow-amber-100" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payment method
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
          {isPastDue && (
            <p className="text-xs text-amber-600 mt-1">
              Your last payment failed. Please update your payment method to
              avoid service interruption.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ) : cards.length === 0 ? (
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>No payment method on file</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add card
              </Button>
            </div>
          ) : (
            cards.map((card) => {
              const brand = card.card?.brand ?? "unknown";
              const last4 = card.card?.last4 ?? "????";
              const expMonth = card.card?.exp_month ?? 0;
              const expYear = card.card?.exp_year ?? 0;
              const holderName = card.billing_details?.name;
              const funding = card.card?.funding;
              const wType = card.card?.wallet?.type;

              return (
                <div
                  key={card.id}
                  className={
                    "flex items-center justify-between rounded-md border p-3 transition-colors " +
                    (card.is_default
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "hover:bg-muted/30")
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-14 items-center justify-center rounded border bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                      {formatCardBrand(brand)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium tabular-nums">
                          {"••••"} {last4}
                        </p>
                        {card.is_default && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            Default
                          </Badge>
                        )}
                        {wType && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {WALLET_LABELS[wType] ?? wType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {holderName && <span className="mr-1.5">{holderName}</span>}
                        Exp {formatExpiryDate(expMonth, expYear)}
                        {funding && funding !== "unknown" && (
                          <span className="ml-1.5 capitalize">{"\u00b7"} {funding}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!card.is_default && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(card.id)}
                          disabled={settingDefaultId === card.id}
                        >
                          {settingDefaultId === card.id ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Star className="mr-2 h-3.5 w-3.5" />
                          )}
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setRemoveConfirm(card)}
                        disabled={removingId === card.id}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!removeConfirm}
        onOpenChange={(open) => !open && setRemoveConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              {"The card ending in " + (removeConfirm?.card?.last4 ?? "????") + " will be removed. " +
                (removeConfirm?.is_default && cards.length > 1
                  ? "This is your default payment method. Please set another card as default first."
                  : "This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!removingId}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={!!removingId || (!!removeConfirm?.is_default && cards.length > 1)}
            >
              {removingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StripePaymentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        customerId={stripeCustomerId ?? undefined}
      />
    </>
  );
}
