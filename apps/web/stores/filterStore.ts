import { create } from 'zustand';
import { DEFAULT_FILTER_PRICE_RANGE } from '@/lib/constants';

export type SortBy = 'price' | 'name' | 'discount' | 'benefit';

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

export const useFilterStore = create<FilterState>((set) => ({
    // NOTE: 초기 상태는 lib/constants.ts의 기본값들과 동기화되어야 함.
    searchQuery: '',
    selectedBrand: 'all',
    selectedCity: 'all',
    sortBy: 'price',
    priceRange: DEFAULT_FILTER_PRICE_RANGE,
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
        priceRange: [0, 2000000], // DEFAULT_FILTER_PRICE_RANGE 명시적 값 유지 권장
        showFavoritesOnly: false,
    }),
}));
