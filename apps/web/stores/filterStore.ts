import { create } from 'zustand';
import type { Tag } from '@/lib/types';

interface FilterState {
    searchQuery: string;
    brand: string | null;
    sortBy: 'price_asc' | 'name_asc';
    setSearchQuery: (query: string) => void;
    setBrand: (brand: string | null) => void;
    setSortBy: (sort: 'price_asc' | 'name_asc') => void;
    reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    searchQuery: '',
    brand: null,
    sortBy: 'price_asc',
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setBrand: (brand) => set({ brand }),
    setSortBy: (sortBy) => set({ sortBy }),
    reset: () => set({ searchQuery: '', brand: null, sortBy: 'price_asc' }),
}));
