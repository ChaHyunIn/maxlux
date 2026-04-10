'use client'
import { useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { HotelCard } from './HotelCard';
import { HotelFilters } from './HotelFilters';
import { useFilterStore } from '@/stores/filterStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLocale } from 'next-intl';
import { HOT_DEAL_THRESHOLD, DEFAULT_FILTER_PRICE_RANGE } from '@/lib/constants';
import { useFavorites } from '@/hooks/useFavorites';
import { getHotelName } from '@/lib/hotelUtils';

export function HotelList({ hotels }: { hotels: (Hotel & { min_price?: number })[] }) {
    const { searchQuery, selectedBrand, selectedCity, sortBy, priceRange, showFavoritesOnly } = useFilterStore();
    const locale = useLocale();
    const { favorites: favoriteIds } = useFavorites();

    const brands = useMemo(() => {
        const unique = new Set(hotels.map(h => h.brand).filter((b): b is string => typeof b === 'string' && b.length > 0));
        return Array.from(unique).sort();
    }, [hotels]);

    const filteredHotels = useMemo(() => {
        let result = [...hotels];

        // Text search
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(h =>
                getHotelName(h, locale).toLowerCase().includes(lowerQ)
            );
        }

        // Brand filter
        if (selectedBrand !== 'all') {
            result = result.filter(h => h.brand === selectedBrand);
        }

        // City filter
        if (selectedCity !== 'all') {
            result = result.filter(h => h.city === selectedCity);
        }

        // Price range filter
        const [minPrice, maxPrice] = priceRange;
        if (minPrice > 0 || maxPrice < DEFAULT_FILTER_PRICE_RANGE[1]) {
            result = result.filter(h => {
                if (!h.min_price) return minPrice === 0;
                return h.min_price >= minPrice && h.min_price <= maxPrice;
            });
        }

        // Favorites filter
        if (showFavoritesOnly) {
            result = result.filter(h => favoriteIds.includes(h.id));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'price') {
                return (a.min_price ?? Infinity) - (b.min_price ?? Infinity);
            }
            if (sortBy === 'discount') {
                const aIsHot = a.min_price && a.min_price <= HOT_DEAL_THRESHOLD ? 1 : 0;
                const bIsHot = b.min_price && b.min_price <= HOT_DEAL_THRESHOLD ? 1 : 0;
                if (aIsHot !== bIsHot) return bIsHot - aIsHot;
                return (a.min_price ?? Infinity) - (b.min_price ?? Infinity);
            }
            if (sortBy === 'benefit') {
                const aVal = a.benefit_value_krw ?? 0;
                const bVal = b.benefit_value_krw ?? 0;
                return bVal - aVal;
            }
            return getHotelName(a, locale).localeCompare(getHotelName(b, locale));
        });

        return result;
    }, [hotels, searchQuery, selectedBrand, selectedCity, sortBy, priceRange, showFavoritesOnly, favoriteIds, locale]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <HotelFilters brands={brands} resultCount={filteredHotels.length} locale={locale} hotels={hotels} />
            {filteredHotels.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotels.map(hotel => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            )}
        </div>
    );
}
