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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from "lucide-react";
import type { Invoice } from "@/types/billing";

interface InvoiceListProps {
  organizationId: string;
}

export function InvoiceList({ organizationId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    BillingService.getInvoices(organizationId)
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organizationId]);

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.stripe_invoice_pdf) {
      window.open(invoice.stripe_invoice_pdf, "_blank");
      return;
    }
    try {
      const url = await BillingService.getInvoiceDownloadUrl(organizationId, invoice.id);
      window.open(url, "_blank");
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No invoices yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>
              <span className="text-sm font-medium">{inv.invoice_number}</span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(inv.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs capitalize">
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm font-medium">
              ${inv.amount} {inv.currency}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => handleDownload(inv)}>
                <File className="h-3.5 w-3.5 mr-1.5" />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
