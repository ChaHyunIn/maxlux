'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useClickOutside } from '@/hooks/useClickOutside';
import { DEFAULT_FILTER_PRICE_RANGE } from '@/lib/constants';
import { useFilterStore } from "@/stores/filterStore"
import { FilterContent } from './FilterContent';
import { SearchAutocomplete } from './SearchAutocomplete';
import type { Hotel } from '@/lib/types';

export function HotelFilters({
    brands,
    resultCount,
    locale,
    hotels = [],
}: {
    brands: string[];
    resultCount: number;
    locale: string;
    hotels?: (Hotel & { min_price?: number })[];
}) {
    const t = useTranslations('hotel');
    const {
        searchQuery, selectedBrand, selectedCity, sortBy, priceRange,
        showFavoritesOnly, resetFilters, setSearchQuery,
    } = useFilterStore();
    const [sheetOpen, setSheetOpen] = useState(false);

    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const [mobileSearch, setMobileSearch] = useState(searchQuery);
    const [showMobileAutocomplete, setShowMobileAutocomplete] = useState(false);
    const mobileDebouncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMobileSearch(searchQuery);
    }, [searchQuery]);

    useClickOutside(mobileContainerRef, () => setShowMobileAutocomplete(false));

    const handleMobileSearch = useCallback((val: string) => {
        setMobileSearch(val);
        setShowMobileAutocomplete(val.trim().length > 0);
        if (mobileDebouncRef.current) clearTimeout(mobileDebouncRef.current);
        mobileDebouncRef.current = setTimeout(() => setSearchQuery(val), 300);
    }, [setSearchQuery]);

    const activeCount = [
        searchQuery.trim() !== '',
        selectedBrand !== 'all',
        selectedCity !== 'all',
        sortBy !== 'price',
        priceRange[0] !== DEFAULT_FILTER_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_FILTER_PRICE_RANGE[1],
        showFavoritesOnly,
    ].filter(Boolean).length;

    return (
        <div className="mb-6">
            <div className="hidden sm:flex flex-wrap items-center gap-4">
                <FilterContent brands={brands} hotels={hotels} t={t} locale={locale} />
                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-500 px-3"
                        onClick={resetFilters}
                    >
                        <X className="w-3.5 h-3.5 mr-1" />
                        {t('resetFilters')}
                    </Button>
                )}
            </div>

            <div className="flex sm:hidden items-center justify-between gap-3">
                <div className="relative flex-1" ref={mobileContainerRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={mobileSearch}
                        onChange={(e) => handleMobileSearch(e.target.value)}
                        onFocus={() => { if (mobileSearch.trim()) setShowMobileAutocomplete(true); }}
                        className="pl-9 bg-white"
                    />
                    <SearchAutocomplete
                        query={mobileSearch}
                        hotels={hotels}
                        locale={locale}
                        onSelect={(name) => {
                            setMobileSearch(name);
                            setSearchQuery(name);
                        }}
                        visible={showMobileAutocomplete}
                        onClose={() => setShowMobileAutocomplete(false)}
                    />
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger render={<Button variant="outline" size="sm" className="relative shrink-0" />}>
                        <SlidersHorizontal className="w-4 h-4 mr-1" />
                        {t('filterButton')}
                        {activeCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-red-500 border-0">
                                {activeCount}
                            </Badge>
                        )}
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto rounded-t-2xl">
                        <SheetHeader className="mb-4">
                            <SheetTitle>{t('filterTitle')}</SheetTitle>
                        </SheetHeader>
                        <FilterContent brands={brands} hotels={hotels} t={t} locale={locale} onClose={() => setSheetOpen(false)} />
                        <div className="flex gap-3 mt-6">
                            {activeCount > 0 && (
                                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                                    {t('resetFilters')}
                                </Button>
                            )}
                            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                                {t('resultCount', { count: resultCount })}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="hidden sm:flex items-center justify-between mt-3">
                <p className="text-sm text-slate-500">{t('resultCount', { count: resultCount })}</p>
            </div>
        </div>
    );
}
