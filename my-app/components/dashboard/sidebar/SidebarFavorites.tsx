'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useFavorites } from '@/hooks/use-favorites';
import { SortableFavoriteItem, DragOverlayItem } from './SortableFavoriteItem';
import { FavoriteFolderSection } from './FavoriteFolderSection';
import type { FavoriteItem } from '@/types/sidebar';

export function SidebarFavorites() {
  const [open, setOpen] = useState(true);
  const { favorites, createFolder, reorder } = useFavorites();
  const [activeItem, setActiveItem] = useState<FavoriteItem | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    if (showFolderInput) inputRef.current?.focus();
  }, [showFolderInput]);

  const rootItems = favorites.items.filter((i) => !i.folderId);

  const handleDragStart = (event: DragStartEvent) => {
    const item = favorites.items.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);

    // Dropping onto a folder header
    if (overId.startsWith('folder:')) {
      const folderId = overId.replace('folder:', '');
      const updated = favorites.items.map((i) =>
        i.id === active.id ? { ...i, folderId } : i,
      );
      reorder(updated);
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overId = String(over.id);

    // If dropping on a folder droppable, already handled in dragOver
    if (overId.startsWith('folder:')) return;

    const oldIndex = favorites.items.findIndex((i) => i.id === active.id);
    const newIndex = favorites.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Move item into the same folder as the target
    const targetFolder = favorites.items[newIndex].folderId;
    const moved = arrayMove(favorites.items, oldIndex, newIndex);
    const updated = moved.map((i) =>
      i.id === active.id ? { ...i, folderId: targetFolder } : i,
    );
    reorder(updated);
  };

  const commitFolderCreate = () => {
    const trimmed = folderName.trim();
    if (trimmed) createFolder(trimmed);
    setFolderName('');
    setShowFolderInput(false);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1 px-3 mb-1">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Favorites
            </span>
            <ChevronRight
              className={cn(
                'size-3 text-muted-foreground transition-transform duration-200',
                open && 'rotate-90',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <button
          type="button"
          onClick={() => setShowFolderInput(true)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          title="Create folder"
        >
          <Plus className="size-3" />
        </button>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {favorites.items.length === 0 && favorites.folders.length === 0 && !showFolderInput ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Right-click any item to pin it here
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-0.5">
              {/* Root items (no folder) */}
              <SortableContext
                items={rootItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {rootItems.map((item) => (
                  <SortableFavoriteItem key={item.id} item={item} />
                ))}
              </SortableContext>

              {/* Folders */}
              {favorites.folders.map((folder) => {
                const folderItems = favorites.items.filter(
                  (i) => i.folderId === folder.id,
                );
                return (
                  <FavoriteFolderSection
                    key={folder.id}
                    folder={folder}
                    items={folderItems}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeItem && <DragOverlayItem item={activeItem} />}
            </DragOverlay>
          </DndContext>
        )}

        {/* Inline create folder input */}
        {showFolderInput && (
          <div className="px-2 py-1">
            <input
              ref={inputRef}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onBlur={commitFolderCreate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitFolderCreate();
                if (e.key === 'Escape') {
                  setFolderName('');
                  setShowFolderInput(false);
                }
              }}
              placeholder="Folder name…"
              className="w-full rounded-squircle-md border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-ring"
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
