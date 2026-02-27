"use client";

import { useEffect, useState } from "react";
import { BillingService } from "@/services/billing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types/billing";

interface TransactionHistoryProps {
  organizationId: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "secondary",
  pending: "outline",
  failed: "destructive",
  refunded: "outline",
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
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No transactions yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell className="text-sm">{txn.description || "Payment"}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[txn.status] || "outline"} className="text-xs capitalize">
                {txn.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm capitalize text-muted-foreground">
              {txn.payment_provider}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(txn.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right text-sm font-medium">
              ${txn.amount} {txn.currency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
