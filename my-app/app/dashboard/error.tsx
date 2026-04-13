"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Dashboard Error
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Something went wrong loading this page. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
