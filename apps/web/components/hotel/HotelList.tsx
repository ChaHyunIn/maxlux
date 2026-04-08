'use client'
import { useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { HotelCard } from './HotelCard';
import { HotelFilters } from './HotelFilters';
import { useFilterStore } from '@/stores/filterStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslations } from 'next-intl';

export function HotelList({ hotels }: { hotels: (Hotel & { min_price?: number })[] }) {
    const { searchQuery, selectedBrand, sortBy } = useFilterStore();
    const t = useTranslations('common');

    const brands = useMemo(() => {
        const unique = new Set(hotels.map(h => h.brand).filter(Boolean) as string[]);
        return Array.from(unique).sort();
    }, [hotels]);

    const filteredHotels = useMemo(() => {
        let result = [...hotels];
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(h =>
                h.name_ko.toLowerCase().includes(lowerQ) ||
                h.name_en.toLowerCase().includes(lowerQ)
            );
        }
        if (selectedBrand !== 'all') {
            result = result.filter(h => h.brand === selectedBrand);
        }
        result.sort((a, b) => {
            if (sortBy === 'price') {
                return (a.min_price ?? Infinity) - (b.min_price ?? Infinity);
            }
            return a.name_ko.localeCompare(b.name_ko);
        });
        return result;
    }, [hotels, searchQuery, selectedBrand, sortBy]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <HotelFilters brands={brands} />
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
