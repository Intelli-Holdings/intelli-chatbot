// components/ui/card.tsx
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: string;
  href?: string;
  children: ReactNode;
}

export function Card({ title, icon, href, children }: CardProps) {
  const content = (
    <div className="rounded-lg border p-4 hover:border-blue-500 transition-colors">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}

export function CardGroup({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {children}
    </div>
  );
}