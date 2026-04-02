'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { SidebarItem, SidebarGroup, SidebarMore } from '@/types/sidebar';
import { SidebarNavLink } from './SidebarLink';
import { SidebarNavGroup } from './SidebarGroup';
import { SidebarNavMore } from './SidebarMore';
import { SidebarFavorites } from './SidebarFavorites';
import { FavoritesProvider } from '@/hooks/use-favorites';

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'intelli:sidebar-groups';

function loadCollapseState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCollapseState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ---------------------------------------------------------------------------
// Helpers — check if any child in an item matches the active path
// ---------------------------------------------------------------------------

function isGroupActive(item: SidebarGroup | SidebarMore, pathname: string) {
  return item.children.some((c) => pathname === c.href);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SidebarNavProps {
  coreItems: SidebarItem[];
  workspaceItems: SidebarItem[];
  notificationCount?: number;
}

export function SidebarNav({
  coreItems,
  workspaceItems,
  notificationCount = 0,
}: SidebarNavProps) {
  const pathname = usePathname();

  // Collapse state for groups — initialise with config defaults only
  // (localStorage is loaded after mount to avoid hydration mismatch)
  const [groupState, setGroupState] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    const allItems = [...coreItems, ...workspaceItems];
    for (const item of allItems) {
      if (item.type === 'group') {
        defaults[item.label] = item.defaultOpen ?? false;
      }
    }
    return defaults;
  });

  const [hydrated, setHydrated] = useState(false);

  // After mount, merge persisted state from localStorage
  useEffect(() => {
    const persisted = loadCollapseState();
    if (Object.keys(persisted).length > 0) {
      setGroupState((prev) => ({ ...prev, ...persisted }));
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever groupState changes (skip initial render)
  useEffect(() => {
    if (hydrated) saveCollapseState(groupState);
  }, [groupState, hydrated]);

  // Auto-expand group when navigating to a child route
  useEffect(() => {
    const allItems = [...coreItems, ...workspaceItems];
    for (const item of allItems) {
      if (item.type === 'group' && isGroupActive(item, pathname)) {
        setGroupState((prev) => {
          if (prev[item.label]) return prev; // already open
          return { ...prev, [item.label]: true };
        });
      }
    }
  }, [pathname, coreItems, workspaceItems]);

  const toggleGroup = useCallback((label: string) => {
    setGroupState((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Inject live notification count into the config items
  const patchedCoreItems = coreItems.map((item) => {
    if (item.type === 'link' && item.label === 'Notifications') {
      return { ...item, badge: notificationCount };
    }
    return item;
  });

  return (
    <FavoritesProvider>
      <div className="flex flex-1 flex-col overflow-y-auto px-2">
        {/* Section 1 — Core */}
        <div className="flex flex-col gap-0.5 py-2">
          {patchedCoreItems.map((item) => (
            <NavItem
              key={itemKey(item)}
              item={item}
              groupState={groupState}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Section 2 — Workspace */}
        <div className="flex flex-col gap-0.5 py-2">
          <span className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </span>
          {workspaceItems.map((item) => (
            <NavItem
              key={itemKey(item)}
              item={item}
              groupState={groupState}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Section 3 — Favorites */}
        <div className="py-2">
          <SidebarFavorites />
        </div>
      </div>
    </FavoritesProvider>
  );
}

// ---------------------------------------------------------------------------
// Render a single sidebar item based on its type
// ---------------------------------------------------------------------------

function NavItem({
  item,
  groupState,
  toggleGroup,
}: {
  item: SidebarItem;
  groupState: Record<string, boolean>;
  toggleGroup: (label: string) => void;
}) {
  switch (item.type) {
    case 'link':
      return <SidebarNavLink item={item} />;
    case 'group':
      return (
        <SidebarNavGroup
          item={item}
          open={groupState[item.label] ?? false}
          onToggle={() => toggleGroup(item.label)}
        />
      );
    case 'more':
      return <SidebarNavMore item={item} />;
    case 'section-label':
      return (
        <span className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {item.label}
        </span>
      );
    default:
      return null;
  }
}

function itemKey(item: SidebarItem): string {
  switch (item.type) {
    case 'link':
      return item.href;
    case 'group':
    case 'more':
    case 'section-label':
      return item.label;
  }
}
