// components/docs/code-group.tsx

import { ReactNode } from 'react';

interface CodeGroupProps {
  children: ReactNode;
}

export function CodeGroup({ children }: CodeGroupProps) {
  return (
    <div className="code-group my-4">
      {children}
    </div>
  );
}