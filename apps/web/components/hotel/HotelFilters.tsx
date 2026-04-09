'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useFilterStore } from "@/stores/filterStore"
import { useTranslations } from 'next-intl';
import { Search, X, SlidersHorizontal, Heart, MapPin } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Hotel } from '@/lib/types';
import { Link } from '@/i18n/navigation';
import { CITY_DISPLAY_MAP, getCityDisplayName } from '@/lib/cityMapper';

const CITY_KEYS = ['seoul', 'busan', 'jeju'] as const;

interface AutocompleteItem {
    id: string;
    slug: string;
    name: string;
    city: string;
    brand: string | null;
}

function SearchAutocomplete({
    query,
    hotels,
    locale,
    onSelect,
    visible,
    onClose,
}: {
    query: string;
    hotels: (Hotel & { min_price?: number })[];
    locale: string;
    onSelect: (name: string) => void;
    visible: boolean;
    onClose: () => void;
}) {
    const suggestions = useMemo<AutocompleteItem[]>(() => {
        if (!query.trim() || query.trim().length < 1) return [];
        const lowerQ = query.toLowerCase();
        return hotels
            .filter(h =>
                h.name_ko.toLowerCase().includes(lowerQ) ||
                h.name_en.toLowerCase().includes(lowerQ) ||
                (h.brand && h.brand.toLowerCase().includes(lowerQ))
            )
            .slice(0, 6)
            .map(h => ({
                id: h.id,
                slug: h.slug,
                name: locale === 'en' ? h.name_en : h.name_ko,
                city: h.city,
                brand: h.brand,
            }));
    }, [query, hotels, locale]);

    if (!visible || suggestions.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((item) => (
                <Link
                    key={item.id}
                    href={`/hotels/${item.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b last:border-b-0 border-slate-100"
                    onClick={() => {
                        onSelect(item.name);
                        onClose();
                    }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                            {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center text-xs text-slate-400">
                                <MapPin className="w-3 h-3 mr-0.5" />
                                {getCityDisplayName(item.city, locale)}
                            </span>
                            {item.brand && (
                                <span className="text-xs text-slate-400">{item.brand}</span>
                            )}
                        </div>
                    </div>
                    <Search className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                </Link>
            ))}
        </div>
    );
}

function FilterContent({
    brands,
    hotels,
    t,
    locale,
    onClose,
}: {
    brands: string[];
    hotels: (Hotel & { min_price?: number })[];
    t: ReturnType<typeof useTranslations>;
    locale: string;
    onClose?: () => void;
}) {
    const {
        searchQuery, setSearchQuery,
        selectedBrand, setSelectedBrand,
        selectedCity, setSelectedCity,
        sortBy, setSortBy,
        priceRange, setPriceRange,
        showFavoritesOnly, setShowFavoritesOnly,
        resetFilters,
    } = useFilterStore();

    const searchRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    // Close autocomplete on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = useCallback((val: string) => {
        setLocalSearch(val);
        setShowAutocomplete(val.trim().length > 0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
    }, [setSearchQuery]);

    const PRICE_OPTIONS = [
        { value: '0-2000000', label: t('priceAll') },
        { value: '0-300000', label: t('priceUnder300') },
        { value: '300000-500000', label: t('price300to500') },
        { value: '500000-2000000', label: t('priceOver500') },
    ];
    const priceKey = `${priceRange[0]}-${priceRange[1]}`;
    const handlePriceChange = (val: string) => {
        const [min, max] = val.split('-').map(Number);
        setPriceRange([min, max]);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Search bar with autocomplete */}
            <div className="relative" ref={containerRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Input
                    ref={searchRef}
                    placeholder={t('searchPlaceholder')}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => { if (localSearch.trim()) setShowAutocomplete(true); }}
                    className="pl-9 pr-9 bg-white"
                />
                {localSearch && (
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                        onClick={() => { handleSearchChange(''); searchRef.current?.focus(); }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <SearchAutocomplete
                    query={localSearch}
                    hotels={hotels}
                    locale={locale}
                    onSelect={(name) => {
                        setLocalSearch(name);
                        setSearchQuery(name);
                    }}
                    visible={showAutocomplete}
                    onClose={() => setShowAutocomplete(false)}
                />
            </div>

            {/* City chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${selectedCity === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                    onClick={() => setSelectedCity('all')}
                >
                    {t('allCities')}
                </button>
                {CITY_KEYS.map(city => (
                    <button
                        key={city}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${selectedCity === city ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                        onClick={() => setSelectedCity(city)}
                    >
                        {getCityDisplayName(city, locale)}
                    </button>
                ))}
            </div>

            {/* Row 2: Brand + Price + Sort + Favorites */}
            <div className="flex flex-wrap gap-3">
                <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || 'all')}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <SelectValue placeholder={t('allBrands')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allBrands')}</SelectItem>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={priceKey} onValueChange={(val) => val && handlePriceChange(val)}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <SelectValue placeholder={t('priceAll')} />
                    </SelectTrigger>
                    <SelectContent>
                        {PRICE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <SelectValue placeholder={t('sortByPrice')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price">{t('sortByPrice')}</SelectItem>
                        <SelectItem value="name">{t('sortByName')}</SelectItem>
                        <SelectItem value="discount">{t('sortByDiscount')}</SelectItem>
                        <SelectItem value="benefit">{t('sortByBenefit')}</SelectItem>
                    </SelectContent>
                </Select>

                <button
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${showFavoritesOnly ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                    <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                    {t('favoritesOnly')}
                </button>
            </div>
        </div>
    );
}

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

    // Mobile autocomplete state
    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const [mobileSearch, setMobileSearch] = useState(searchQuery);
    const [showMobileAutocomplete, setShowMobileAutocomplete] = useState(false);
    const mobileDebouncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMobileSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (mobileContainerRef.current && !mobileContainerRef.current.contains(e.target as Node)) {
                setShowMobileAutocomplete(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMobileSearch = useCallback((val: string) => {
        setMobileSearch(val);
        setShowMobileAutocomplete(val.trim().length > 0);
        if (mobileDebouncRef.current) clearTimeout(mobileDebouncRef.current);
        mobileDebouncRef.current = setTimeout(() => setSearchQuery(val), 300);
    }, [setSearchQuery]);

    const DEFAULT_PRICE_RANGE = [0, 2000000];
    const activeCount = [
        searchQuery.trim() !== '',
        selectedBrand !== 'all',
        selectedCity !== 'all',
        sortBy !== 'price',
        priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1],
        showFavoritesOnly,
    ].filter(Boolean).length;

    return (
        <div className="mb-6">
            {/* Desktop */}
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

            {/* Mobile */}
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

            {/* Result count + reset for desktop */}
            <div className="hidden sm:flex items-center justify-between mt-3">
                <p className="text-sm text-slate-500">{t('resultCount', { count: resultCount })}</p>
            </div>
        </div>
    );
}
