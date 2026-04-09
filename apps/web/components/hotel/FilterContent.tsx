import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFilterStore } from "@/stores/filterStore"
import { Search, X, Heart } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { getCityKey } from '@/lib/cityMapper';
import { getBrandKey } from '@/lib/brandMapper';
import { SearchAutocomplete } from './SearchAutocomplete';
import { useTranslations } from 'next-intl';

import { SUPPORTED_CITIES } from '@/lib/constants';

const PRICE_RANGE_VALUES = [
    { value: '0-2000000', labelKey: 'priceAll' },
    { value: '0-300000', labelKey: 'priceUnder300' },
    { value: '300000-500000', labelKey: 'price300to500' },
    { value: '500000-2000000', labelKey: 'priceOver500' },
];

export function FilterContent({
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
    const tBrand = useTranslations('brand');
    const tCity = useTranslations('city');
    
    const {
        searchQuery, setSearchQuery,
        selectedBrand, setSelectedBrand,
        selectedCity, setSelectedCity,
        sortBy, setSortBy,
        priceRange, setPriceRange,
        showFavoritesOnly, setShowFavoritesOnly,
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
            if (containerRef.current && (e.target instanceof Node) && !containerRef.current.contains(e.target)) {
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

    const PRICE_OPTIONS = useMemo(() => PRICE_RANGE_VALUES.map((opt: { value: string; labelKey: string }) => ({
        value: opt.value,
        label: t(opt.labelKey)
    })), [t]);

    const priceKey = `${priceRange[0]}-${priceRange[1]}`;
    const handlePriceChange = (val: string) => {
        const parts = val.split('-').map(Number);
        const min = parts[0];
        const max = parts[1];
        if (min !== undefined && max !== undefined) {
            setPriceRange([min, max]);
        }
    };

    const brandLabel = selectedBrand === 'all' 
        ? t('allBrands') 
        : (() => {
            const bKey = getBrandKey(selectedBrand);
            return bKey ? tBrand(bKey) : selectedBrand;
        })();

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
                        onClose?.();
                    }}
                    visible={showAutocomplete}
                    onClose={() => setShowAutocomplete(false)}
                />
            </div>

            {/* City chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${selectedCity === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                    onClick={() => { setSelectedCity('all'); onClose?.(); }}
                >
                    {t('allCities')}
                </button>
                {SUPPORTED_CITIES.map(city => {
                    const cityKey = getCityKey(city);
                    return (
                        <button
                            key={city}
                            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${selectedCity === city ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                            onClick={() => { setSelectedCity(city); onClose?.(); }}
                        >
                            {cityKey ? tCity(cityKey) : city}
                        </button>
                    );
                })}
            </div>

            {/* Row 2: Brand + Price + Sort + Favorites */}
            <div className="flex flex-wrap gap-3">
                <Select value={selectedBrand} onValueChange={(val) => { setSelectedBrand(val || 'all'); onClose?.(); }}>
                    <SelectTrigger className="w-[140px] bg-white text-slate-900">
                        <SelectValue placeholder={t('allBrands')}>
                            {brandLabel}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allBrands')}</SelectItem>
                        {brands.map(brand => {
                            const bKey = getBrandKey(brand);
                            return (
                                <SelectItem key={brand} value={brand}>
                                    {bKey ? tBrand(bKey) : brand}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <Select value={priceKey} onValueChange={(val) => { if (val) handlePriceChange(val); onClose?.(); }}>
                    <SelectTrigger className="w-[140px] bg-white text-slate-900">
                        <SelectValue placeholder={t('priceAll')}>
                            {PRICE_OPTIONS.find((opt: { value: string; label: string }) => opt.value === priceKey)?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {PRICE_OPTIONS.map((opt: { value: string; label: string }) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val) => {
                    if (val === 'price' || val === 'name' || val === 'discount' || val === 'benefit') {
                        setSortBy(val);
                        onClose?.();
                    }
                }}>
                    <SelectTrigger className="w-[140px] bg-white text-slate-900">
                        <SelectValue placeholder={t('sortByPrice')}>
                            {sortBy === 'price' ? t('sortByPrice') :
                                sortBy === 'name' ? t('sortByName') :
                                    sortBy === 'discount' ? t('sortByDiscount') :
                                        sortBy === 'benefit' ? t('sortByBenefit') : undefined}
                        </SelectValue>
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
                    onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); onClose?.(); }}
                >
                    <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                    {t('favoritesOnly')}
                </button>
            </div>
        </div>
    );
}
