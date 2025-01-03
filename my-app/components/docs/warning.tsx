// components/docs/warning.tsx

import { ReactNode } from 'react';

interface WarningProps {
  children: ReactNode;
}

export function Warning({ children }: WarningProps) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md my-4">
      <strong className="text-yellow-700">Warning:</strong> {children}
    </div>
  );
}