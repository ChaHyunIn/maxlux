'use client'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useFilterStore } from "@/stores/filterStore"
import { useTranslations } from 'next-intl';
import { Search, X, SlidersHorizontal, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const CITY_KEYS = ['seoul', 'busan', 'jeju'] as const;
const CITY_LABELS: Record<string, { ko: string; en: string }> = {
    seoul: { ko: '서울', en: 'Seoul' },
    busan: { ko: '부산', en: 'Busan' },
    jeju: { ko: '제주', en: 'Jeju' },
};

function useCityLabel(city: string, locale: string) {
    if (city === 'all') return null;
    return CITY_LABELS[city]?.[locale as 'ko' | 'en'] || city;
}

function FilterContent({
    brands,
    t,
    locale,
    onClose,
}: {
    brands: string[];
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
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    const handleSearchChange = (val: string) => {
        setLocalSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
    };

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
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    ref={searchRef}
                    placeholder={t('searchPlaceholder')}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 pr-9 bg-white"
                />
                {localSearch && (
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => { handleSearchChange(''); searchRef.current?.focus(); }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
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
                        {CITY_LABELS[city][locale as 'ko' | 'en']}
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

export function HotelFilters({ brands, resultCount, locale }: { brands: string[]; resultCount: number; locale: string }) {
    const t = useTranslations('hotel');
    const {
        searchQuery, selectedBrand, selectedCity, sortBy, priceRange,
        showFavoritesOnly, resetFilters,
    } = useFilterStore();
    const [sheetOpen, setSheetOpen] = useState(false);

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
                <FilterContent brands={brands} t={t} locale={locale} />
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
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => useFilterStore.getState().setSearchQuery(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger>
                        <Button variant="outline" size="sm" className="relative shrink-0">
                            <SlidersHorizontal className="w-4 h-4 mr-1" />
                            {t('filterButton')}
                            {activeCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-red-500 border-0">
                                    {activeCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto rounded-t-2xl">
                        <SheetHeader className="mb-4">
                            <SheetTitle>{t('filterTitle')}</SheetTitle>
                        </SheetHeader>
                        <FilterContent brands={brands} t={t} locale={locale} onClose={() => setSheetOpen(false)} />
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
