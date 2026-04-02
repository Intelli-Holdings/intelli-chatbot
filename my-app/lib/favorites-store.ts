import type { FavoritesState } from '@/types/sidebar';

const STORAGE_KEY = 'intelli:sidebar-favorites';

const DEFAULT_STATE: FavoritesState = { items: [], folders: [] };

export function loadFavorites(): FavoritesState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveFavorites(state: FavoritesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}
