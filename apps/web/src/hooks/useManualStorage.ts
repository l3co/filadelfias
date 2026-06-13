import { useCallback, useState } from 'react';

const FAVORITES_KEY = 'manual-favorites';
const RECENT_KEY = 'manual-recent';
const MAX_RECENT = 5;

export interface RecentArticle {
  id: string;
  number: string;
  excerpt: string;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useManualStorage() {
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));
  const [recent, setRecent] = useState<RecentArticle[]>(() => readStorage(RECENT_KEY, []));

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addRecent = useCallback((article: RecentArticle) => {
    setRecent(prev => {
      const filtered = prev.filter(x => x.id !== article.id);
      const next = [article, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, recent, toggleFavorite, addRecent, isFavorite };
}
