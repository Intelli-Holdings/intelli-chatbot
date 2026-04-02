'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  FavoriteItem,
  FavoritesState,
  SidebarLink,
} from '@/types/sidebar';
import { loadFavorites, saveFavorites } from '@/lib/favorites-store';
import { getIconName } from '@/lib/sidebar-icon-registry';
import React from 'react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface FavoritesContextValue {
  favorites: FavoritesState;
  addFavorite: (link: SidebarLink, folderId?: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (href: string) => boolean;
  createFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
  reorder: (items: FavoriteItem[]) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_STATE: FavoritesState = { items: [], folders: [] };

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritesState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setFavorites(loadFavorites());
    setHydrated(true);
  }, []);

  // Persist to localStorage (skip initial render)
  useEffect(() => {
    if (hydrated) saveFavorites(favorites);
  }, [favorites, hydrated]);

  const addFavorite = useCallback(
    (link: SidebarLink, folderId?: string) => {
      setFavorites((prev) => {
        if (prev.items.some((i) => i.href === link.href)) return prev;
        const item: FavoriteItem = {
          id: crypto.randomUUID(),
          label: link.label,
          iconName: getIconName(link.icon),
          href: link.href,
          folderId,
        };
        return { ...prev, items: [...prev.items, item] };
      });
    },
    [],
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  }, []);

  const isFavorite = useCallback(
    (href: string) => favorites.items.some((i) => i.href === href),
    [favorites.items],
  );

  const createFolder = useCallback((name: string) => {
    setFavorites((prev) => ({
      ...prev,
      folders: [
        ...prev.folders,
        { id: crypto.randomUUID(), name, isOpen: true },
      ],
    }));
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFavorites((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFavorites((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== id),
      items: prev.items.map((i) =>
        i.folderId === id ? { ...i, folderId: undefined } : i,
      ),
    }));
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setFavorites((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === id ? { ...f, isOpen: !f.isOpen } : f,
      ),
    }));
  }, []);

  const reorder = useCallback((items: FavoriteItem[]) => {
    setFavorites((prev) => ({ ...prev, items }));
  }, []);

  const value: FavoritesContextValue = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolder,
    reorder,
  };

  return React.createElement(
    FavoritesContext.Provider,
    { value },
    children,
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
