import { create } from 'zustand';

type SortBy = 'price' | 'name' | 'discount' | 'benefit';

interface FilterState {
    searchQuery: string;
    selectedBrand: string;
    selectedCity: string;
    sortBy: SortBy;
    priceRange: [number, number];
    showFavoritesOnly: boolean;
    setSearchQuery: (q: string) => void;
    setSelectedBrand: (b: string) => void;
    setSelectedCity: (c: string) => void;
    setSortBy: (s: SortBy) => void;
    setPriceRange: (r: [number, number]) => void;
    setShowFavoritesOnly: (v: boolean) => void;
    resetFilters: () => void;
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 2000000];

export const useFilterStore = create<FilterState>((set) => ({
    searchQuery: '',
    selectedBrand: 'all',
    selectedCity: 'all',
    sortBy: 'price',
    priceRange: DEFAULT_PRICE_RANGE,
    showFavoritesOnly: false,
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSelectedBrand: (b) => set({ selectedBrand: b }),
    setSelectedCity: (c) => set({ selectedCity: c }),
    setSortBy: (s) => set({ sortBy: s }),
    setPriceRange: (r) => set({ priceRange: r }),
    setShowFavoritesOnly: (v) => set({ showFavoritesOnly: v }),
    resetFilters: () => set({
        searchQuery: '',
        selectedBrand: 'all',
        selectedCity: 'all',
        sortBy: 'price',
        priceRange: DEFAULT_PRICE_RANGE,
        showFavoritesOnly: false,
    }),
}));

export const DEFAULT_FILTER_PRICE_RANGE = DEFAULT_PRICE_RANGE;
