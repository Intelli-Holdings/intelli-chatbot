// components/docs/tip.tsx

import { ReactNode } from 'react';

interface TipProps {
  children: ReactNode;
}

export function Tip({ children }: TipProps) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-md my-4">
      <strong className="text-green-700">Tip:</strong> {children}
    </div>
  );
}