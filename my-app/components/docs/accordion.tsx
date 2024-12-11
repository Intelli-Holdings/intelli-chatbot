// components/docs/accordion.tsx
import { ReactNode } from 'react';

interface AccordionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export function Accordion({ title, icon, children }: AccordionProps) {
  return (
    <details className="group border-b">
      <summary className="flex items-center justify-between p-4 cursor-pointer">
        <div className="flex items-center gap-2">
          {icon && <span className={`icon-${icon}`} />}
          <h3 className="font-medium">{title}</h3>
        </div>
      </summary>
      <div className="p-4 pt-0">{children}</div>
    </details>
  );
}

export function AccordionGroup({ children }: { children: ReactNode }) {
  return <div className="border-t">{children}</div>;
}