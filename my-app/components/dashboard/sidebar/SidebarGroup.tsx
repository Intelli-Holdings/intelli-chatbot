'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SidebarNavLink } from './SidebarLink';
import type { SidebarGroup as SidebarGroupType } from '@/types/sidebar';

interface SidebarGroupProps {
  item: SidebarGroupType;
  open: boolean;
  onToggle: () => void;
}

export function SidebarNavGroup({ item, open, onToggle }: SidebarGroupProps) {
  const pathname = usePathname();
  const Icon = item.icon;

  // Parent is "active" when any child route matches
  const hasActiveChild = item.children.some((child) => pathname === child.href);

  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex w-full items-center gap-2 rounded-squircle-md px-2 py-1.5 text-sm font-medium transition-colors',
            hasActiveChild && !open
              ? 'bg-[#007fff] text-white'
              : 'text-foreground/80 hover:bg-muted/50',
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          <ChevronRight
            className={cn(
              'ml-auto size-4 shrink-0 transition-transform duration-200',
              open && 'rotate-90',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-0.5 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <SidebarNavLink key={child.href} item={child} indented />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
