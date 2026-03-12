"use client";

import { useEffect, useState } from "react";
import { BillingService } from "@/services/billing";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types/billing";

interface TransactionHistoryProps {
  organizationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  failed: "bg-red-500/10 text-red-600 border-red-200",
  refunded: "bg-muted text-muted-foreground",
};

export function TransactionHistory({ organizationId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    BillingService.getTransactions(organizationId)
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No transactions yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {txn.description || "Payment"}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] h-4 px-1.5 capitalize ${STATUS_STYLES[txn.status] || ""}`}
              >
                {txn.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(txn.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <span className="mx-1.5">·</span>
              <span className="capitalize">{txn.payment_provider}</span>
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums shrink-0">
            ${txn.amount} {txn.currency}
          </span>
        </div>
      ))}
    </div>
  );
}
