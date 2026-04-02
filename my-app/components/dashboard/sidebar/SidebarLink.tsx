'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SidebarLink as SidebarLinkType } from '@/types/sidebar';
import { SidebarItemContextMenu } from './SidebarItemContextMenu';

interface SidebarLinkProps {
  item: SidebarLinkType;
  indented?: boolean;
}

export function SidebarNavLink({ item, indented = false }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <SidebarItemContextMenu item={item}>
      <Link
        href={item.href}
        className={cn(
          'group flex w-full items-center gap-2 rounded-squircle-md px-2 py-1.5 text-sm font-medium transition-colors',
          indented && 'pl-9',
          isActive
            ? 'bg-[#007fff] text-white'
            : 'text-foreground/80 hover:bg-muted/50',
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        {typeof item.badge === 'number' && item.badge > 0 && (
          <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </Link>
    </SidebarItemContextMenu>
  );
}
