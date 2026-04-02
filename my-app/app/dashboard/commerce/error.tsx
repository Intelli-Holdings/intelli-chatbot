'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function CommerceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Commerce Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-lg">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Commerce Error
        </h2>
        <p className="text-sm text-red-600 mb-2">
          {error.message}
        </p>
        <pre className="text-xs text-left bg-red-100 rounded p-3 mb-4 overflow-auto max-h-48 whitespace-pre-wrap">
          {error.stack}
        </pre>
        <Button
          onClick={() => reset()}
          variant="destructive"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
