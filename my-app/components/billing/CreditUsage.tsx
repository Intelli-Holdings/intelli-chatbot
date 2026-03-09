"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import type { CreditBalance } from "@/types/billing";

interface CreditUsageProps {
  credits: CreditBalance | null;
  loading: boolean;
}

export function CreditUsage({ credits, loading }: CreditUsageProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!credits) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            No credit data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { credits_used, credits_total, credits_remaining, usage_percentage } = credits;

  const barColor =
    usage_percentage >= 90
      ? "bg-red-500"
      : usage_percentage >= 75
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Credits
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            {credits_remaining.toLocaleString()} remaining
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, usage_percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {credits_used.toLocaleString()} used
            </span>
            <span className="tabular-nums font-medium">
              {credits_used.toLocaleString()} / {credits_total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Reset info */}
        {credits.period_end && (
          <p className="text-xs text-muted-foreground">
            Resets {new Date(credits.period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
