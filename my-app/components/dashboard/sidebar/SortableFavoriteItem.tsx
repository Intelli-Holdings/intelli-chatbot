'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveIcon } from '@/lib/sidebar-icon-registry';
import { useFavorites } from '@/hooks/use-favorites';
import type { FavoriteItem } from '@/types/sidebar';

interface SortableFavoriteItemProps {
  item: FavoriteItem;
}

export function SortableFavoriteItem({ item }: SortableFavoriteItemProps) {
  const pathname = usePathname();
  const { removeFavorite } = useFavorites();
  const isActive = pathname === item.href;
  const Icon = resolveIcon(item.iconName);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/fav flex items-center gap-1',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="flex shrink-0 cursor-grab items-center opacity-0 group-hover/fav:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3 text-muted-foreground" />
      </button>
      <Link
        href={item.href}
        className={cn(
          'flex flex-1 items-center gap-2 rounded-squircle-md px-2 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[#007fff] text-white'
            : 'text-foreground/80 hover:bg-muted/50',
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        type="button"
        onClick={() => removeFavorite(item.id)}
        className="flex shrink-0 items-center opacity-0 group-hover/fav:opacity-100 transition-opacity"
      >
        <X className="size-3 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}

/** Non-interactive version used inside DragOverlay */
export function DragOverlayItem({ item }: { item: FavoriteItem }) {
  const Icon = resolveIcon(item.iconName);

  return (
    <div className="flex items-center gap-2 rounded-squircle-md bg-muted px-2 py-1.5 text-sm font-medium shadow-lg">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </div>
  );
}
