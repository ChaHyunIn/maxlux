import { create } from 'zustand';

interface FilterState {
    searchQuery: string;
    selectedBrand: string;
    sortBy: 'price' | 'name' | 'discount';
    setSearchQuery: (q: string) => void;
    setSelectedBrand: (b: string) => void;
    setSortBy: (s: 'price' | 'name' | 'discount') => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    searchQuery: '',
    selectedBrand: 'all',
    sortBy: 'price',
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSelectedBrand: (b) => set({ selectedBrand: b }),
    setSortBy: (s) => set({ sortBy: s }),
}));
