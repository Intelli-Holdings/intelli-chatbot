'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { SidebarMore as SidebarMoreType } from '@/types/sidebar';
import { useState } from 'react';
import { SidebarItemContextMenu } from './SidebarItemContextMenu';

interface SidebarMoreProps {
  item: SidebarMoreType;
}

export function SidebarNavMore({ item }: SidebarMoreProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  // "More" row is active when any of its children is the current route
  const hasActiveChild = item.children.some((child) => pathname === child.href);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex w-full items-center gap-2 rounded-squircle-md px-2 py-1.5 text-sm font-medium transition-colors',
            hasActiveChild
              ? 'bg-[#007fff] text-white'
              : 'text-foreground/80 hover:bg-muted/50',
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-48 p-1"
      >
        {item.children.map((child) => {
          const ChildIcon = child.icon;
          const isActive = pathname === child.href;
          return (
            <SidebarItemContextMenu key={child.href} item={child}>
              <button
                type="button"
                onClick={() => {
                  router.push(child.href);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-squircle-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-[#007fff] text-white'
                    : 'hover:bg-muted',
                )}
              >
                <ChildIcon className="size-4 shrink-0" />
                <span>{child.label}</span>
              </button>
            </SidebarItemContextMenu>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
