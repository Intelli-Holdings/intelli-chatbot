'use client';

import type { ReactNode } from 'react';
import { Pin, PinOff } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { useFavorites } from '@/hooks/use-favorites';
import type { SidebarLink } from '@/types/sidebar';

interface SidebarItemContextMenuProps {
  item: SidebarLink;
  children: ReactNode;
}

export function SidebarItemContextMenu({
  item,
  children,
}: SidebarItemContextMenuProps) {
  const { isFavorite, addFavorite, removeFavorite, favorites } =
    useFavorites();

  const favorited = isFavorite(item.href);
  const favItem = favorites.items.find((i) => i.href === item.href);
  const hasFolders = favorites.folders.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {favorited ? (
          <ContextMenuItem
            onSelect={() => {
              if (favItem) removeFavorite(favItem.id);
            }}
          >
            <PinOff className="mr-2 size-4" />
            Remove from Favorites
          </ContextMenuItem>
        ) : hasFolders ? (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Pin className="mr-2 size-4" />
              Add to Favorites
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => addFavorite(item)}>
                Root
              </ContextMenuItem>
              <ContextMenuSeparator />
              {favorites.folders.map((folder) => (
                <ContextMenuItem
                  key={folder.id}
                  onSelect={() => addFavorite(item, folder.id)}
                >
                  {folder.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        ) : (
          <ContextMenuItem onSelect={() => addFavorite(item)}>
            <Pin className="mr-2 size-4" />
            Add to Favorites
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
