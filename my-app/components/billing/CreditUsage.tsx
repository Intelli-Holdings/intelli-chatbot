"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreditBalance } from "@/types/billing";

interface CreditUsageProps {
  credits: CreditBalance | null;
  loading: boolean;
}

export function CreditUsage({ credits, loading }: CreditUsageProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!credits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">AI Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No credit data available.</p>
        </CardContent>
      </Card>
    );
  }

  const { credits_used, credits_total, credits_remaining, usage_percentage } = credits;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">AI Credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usage_percentage >= 90 ? "bg-red-500" : usage_percentage >= 75 ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${Math.min(100, usage_percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {credits_used.toLocaleString()} / {credits_total.toLocaleString()} used
          </span>
          <span className="font-medium">
            {credits_remaining.toLocaleString()} remaining
          </span>
        </div>
        {credits.period_end && (
          <p className="text-xs text-muted-foreground">
            Resets {new Date(credits.period_end).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
