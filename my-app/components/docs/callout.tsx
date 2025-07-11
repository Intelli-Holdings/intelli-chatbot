// components/ui/callouts.tsx
import { ReactNode } from 'react';
import { InfoIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react';

interface CalloutProps {
  children: ReactNode;
}

export function Tip({ children }: CalloutProps) {
  return (
    <div className="my-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <div className="flex items-center gap-2">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Warning({ children }: CalloutProps) {
  return (
    <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Note({ children }: CalloutProps) {
  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <AlertCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <div>{children}</div>
      </div>
    </div>
  );
}