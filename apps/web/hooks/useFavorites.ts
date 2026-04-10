import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

const STORAGE_KEY = STORAGE_KEYS.FAVORITES;

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);

    const loadFavorites = useCallback(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }, []);

    useEffect(() => {
        setFavorites(loadFavorites());

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setFavorites(loadFavorites());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        const handleCustomUpdate = () => {
            setFavorites(loadFavorites());
        };
        window.addEventListener('favorites-updated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('favorites-updated', handleCustomUpdate);
        };
    }, [loadFavorites]);

    const toggleFavorite = useCallback((id: string) => {
        const current = loadFavorites();
        let updated: string[];

        if (current.includes(id)) {
            updated = current.filter((favId: string) => favId !== id);
        } else {
            updated = [...current, id];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setFavorites(updated);

        // Dispatch custom event for components in the same window
        window.dispatchEvent(new Event('favorites-updated'));
    }, [loadFavorites]);

    const isFavorite = useCallback((id: string) => {
        return favorites.includes(id);
    }, [favorites]);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        refresh: loadFavorites
    };
}
