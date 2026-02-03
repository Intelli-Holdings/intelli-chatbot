// components/docs/expandable.tsx
'use client';
import { useState } from 'react';

interface ExpandableProps {
  title: string;
  children: React.ReactNode;
}

export function Expandable({ title, children }: ExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="expandable">
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {title}
      </button>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}