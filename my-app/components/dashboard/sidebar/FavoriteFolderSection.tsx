'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Folder, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';
import { SortableFavoriteItem } from './SortableFavoriteItem';
import type { FavoriteFolder, FavoriteItem } from '@/types/sidebar';

interface FavoriteFolderSectionProps {
  folder: FavoriteFolder;
  items: FavoriteItem[];
}

export function FavoriteFolderSection({
  folder,
  items,
}: FavoriteFolderSectionProps) {
  const { toggleFolder, renameFolder, deleteFolder } = useFavorites();
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({ id: `folder:${folder.id}` });

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== folder.name) {
      renameFolder(folder.id, trimmed);
    } else {
      setNameValue(folder.name);
    }
    setIsRenaming(false);
  };

  return (
    <div className="mt-0.5">
      {/* Folder header — droppable target */}
      <div
        ref={setNodeRef}
        className={cn(
          'group/folder flex items-center gap-1 rounded-squircle-md px-1 py-1 transition-colors',
          isOver && 'bg-muted/80',
        )}
      >
        <button
          type="button"
          onClick={() => toggleFolder(folder.id)}
          className="flex items-center"
        >
          <ChevronRight
            className={cn(
              'size-3 text-muted-foreground transition-transform duration-200',
              folder.isOpen && 'rotate-90',
            )}
          />
        </button>
        <Folder className="size-3.5 text-muted-foreground" />
        {isRenaming ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setNameValue(folder.name);
                setIsRenaming(false);
              }
            }}
            className="flex-1 bg-transparent text-xs font-medium outline-none"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setIsRenaming(true)}
            className="flex flex-1 items-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <span className="truncate">{folder.name}</span>
            <span className="text-[10px] opacity-60">{items.length}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => deleteFolder(folder.id)}
          className="ml-auto opacity-0 group-hover/folder:opacity-100 transition-opacity"
        >
          <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Folder children */}
      {folder.isOpen && (
        <div className="ml-3 flex flex-col gap-0.5">
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableFavoriteItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
