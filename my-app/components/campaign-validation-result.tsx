"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ValidationIssue, ValidationResult } from "@/services/campaign";

interface CampaignValidationResultProps {
  result: ValidationResult;
  className?: string;
  /** Optional title rendered above the issue list. */
  title?: string;
  /** Hide the "All checks passed" green panel when there are no issues. */
  silentWhenValid?: boolean;
}

export function CampaignValidationResult({
  result,
  className,
  title,
  silentWhenValid = false,
}: CampaignValidationResultProps) {
  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    if (silentWhenValid) return null;
    return (
      <div
        className={cn(
          "rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800",
          "dark:border-green-900 dark:bg-green-950/30 dark:text-green-200",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">All checks passed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      {hasErrors && (
        <IssueList
          kind="error"
          icon={AlertCircle}
          headerLabel={`${result.errors.length} error${result.errors.length !== 1 ? "s" : ""} — must fix before sending`}
          headerClassName="text-red-700 dark:text-red-300"
          panelClassName="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          issues={result.errors}
        />
      )}
      {hasWarnings && (
        <IssueList
          kind="warning"
          icon={AlertTriangle}
          headerLabel={`${result.warnings.length} warning${result.warnings.length !== 1 ? "s" : ""} — informational`}
          headerClassName="text-amber-700 dark:text-amber-300"
          panelClassName="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
          issues={result.warnings}
        />
      )}
    </div>
  );
}

interface IssueListProps {
  kind: "error" | "warning";
  icon: React.ComponentType<{ className?: string }>;
  headerLabel: string;
  headerClassName: string;
  panelClassName: string;
  issues: ValidationIssue[];
}

function IssueList({ kind, icon: Icon, headerLabel, headerClassName, panelClassName, issues }: IssueListProps) {
  return (
    <div className={cn("rounded-md border p-3", panelClassName)}>
      <div className={cn("flex items-center gap-2 text-sm font-semibold mb-2", headerClassName)}>
        <Icon className="h-4 w-4" />
        <span>{headerLabel}</span>
      </div>
      <ul className="space-y-2">
        {issues.map((issue) => (
          <li key={`${kind}-${issue.code}`} className="text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <code className="text-xs px-1.5 py-0.5 rounded bg-background/60 border font-mono">
                  {issue.code}
                </code>
                <span className="text-foreground">{issue.message}</span>
              </div>
              {issue.field && (
                <div className="text-xs text-muted-foreground pl-1">
                  field: <code>{issue.field}</code>
                </div>
              )}
              {issue.details?.recipients && issue.details.recipients.length > 0 && (
                <RecipientPreview details={issue.details} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipientPreview({
  details,
}: {
  details: NonNullable<ValidationIssue["details"]>;
}) {
  const recipients = details.recipients ?? [];
  const total = details.count ?? recipients.length;
  const truncated = details.truncated ?? false;

  return (
    <details className="mt-1 pl-1 text-xs">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        Show {recipients.length} affected recipient{recipients.length !== 1 ? "s" : ""}
        {truncated && ` (of ${total})`}
      </summary>
      <ul className="mt-1 space-y-0.5 pl-3">
        {recipients.slice(0, 25).map((r) => (
          <li key={r.id} className="font-mono">
            {r.phone || "—"}
            {r.name && <span className="text-muted-foreground"> · {r.name}</span>}
          </li>
        ))}
        {recipients.length > 25 && (
          <li className="text-muted-foreground italic">…and {recipients.length - 25} more</li>
        )}
      </ul>
    </details>
  );
}
