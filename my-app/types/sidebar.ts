import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Sidebar navigation item types — config-driven so items can be
// reordered, hidden, or extended later (future: "Customize sidebar").
// ---------------------------------------------------------------------------

export interface SidebarLink {
  type: 'link';
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

export interface SidebarGroup {
  type: 'group';
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: SidebarLink[];
}

export interface SidebarMore {
  type: 'more';
  label: string;
  icon: LucideIcon;
  children: SidebarLink[];
}

export interface SidebarSectionLabel {
  type: 'section-label';
  label: string;
}

export type SidebarItem =
  | SidebarLink
  | SidebarGroup
  | SidebarMore
  | SidebarSectionLabel;

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export interface FavoriteItem {
  id: string;
  label: string;
  iconName: string;
  href: string;
  folderId?: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  isOpen: boolean;
}

export interface FavoritesState {
  items: FavoriteItem[];
  folders: FavoriteFolder[];
}
