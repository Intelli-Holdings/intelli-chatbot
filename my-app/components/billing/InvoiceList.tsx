"use client";

import { useEffect, useMemo, useState } from "react";
import { BillingService } from "@/services/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, FileDown } from "lucide-react";
import { toast } from "sonner";
import type { Invoice } from "@/types/billing";

interface InvoiceListProps {
  organizationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  open: "bg-blue-500/10 text-blue-600 border-blue-200",
  void: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  uncollectible: "bg-red-500/10 text-red-600 border-red-200",
};

type StatusFilter = "all" | "paid" | "open" | "void" | "draft" | "uncollectible";

export function InvoiceList({ organizationId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!organizationId) return;
    BillingService.getInvoices(organizationId)
      .then((data) => {
        // Sort most recent first
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInvoices(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organizationId]);

  // Derive available statuses from actual data
  const availableStatuses = useMemo(() => {
    const statuses = new Set(invoices.map((inv) => inv.status));
    return Array.from(statuses);
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q) ||
        new Date(inv.created_at)
          .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          .toLowerCase()
          .includes(q) ||
        `$${inv.amount}`.includes(q);
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.stripe_invoice_pdf) {
      window.open(invoice.stripe_invoice_pdf, "_blank");
      return;
    }
    try {
      const url = await BillingService.getInvoiceDownloadUrl(organizationId, invoice.id);
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  const handleExportAll = () => {
    const downloadable = filtered.filter((inv) => inv.stripe_invoice_pdf);
    if (downloadable.length === 0) {
      toast.info("No downloadable invoices found");
      return;
    }
    downloadable.forEach((inv) => {
      window.open(inv.stripe_invoice_pdf, "_blank");
    });
    toast.success(`Opening ${downloadable.length} invoice(s)`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileDown className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium">No invoices yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Invoices will appear here after your first payment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter + Export toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={handleExportAll}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download all
          </Button>
        </div>
      </div>

      {/* Results count */}
      {(search || statusFilter !== "all") && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Invoice rows */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No invoices match your filters.
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">
                    {inv.invoice_number}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1.5 capitalize ${STATUS_STYLES[inv.status] || ""}`}
                  >
                    {inv.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(inv.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium tabular-nums">
                  ${inv.amount} {inv.currency}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDownload(inv)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
