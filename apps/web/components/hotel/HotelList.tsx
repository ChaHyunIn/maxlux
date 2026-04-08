'use client'
import { useMemo } from 'react';
import type { Hotel } from '@/lib/types';
import { HotelCard } from './HotelCard';
import { HotelFilters } from './HotelFilters';
import { useFilterStore } from '@/stores/filterStore';
import { EmptyState } from '@/components/shared/EmptyState';

export function HotelList({ hotels }: { hotels: (Hotel & { min_price?: number })[] }) {
    const { searchQuery, selectedBrand, sortBy } = useFilterStore();

    // Extract unique brands
    const brands = useMemo(() => {
        const unique = new Set(hotels.map(h => h.brand).filter(Boolean) as string[]);
        return Array.from(unique).sort();
    }, [hotels]);

    const filteredHotels = useMemo(() => {
        let result = [...hotels];

        // Filter by search query
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(h =>
                h.name_ko.toLowerCase().includes(lowerQ) ||
                h.name_en.toLowerCase().includes(lowerQ)
            );
        }

        // Filter by brand
        if (selectedBrand !== 'all') {
            result = result.filter(h => h.brand === selectedBrand);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'price') {
                const priceA = a.min_price ?? Infinity;
                const priceB = b.min_price ?? Infinity;
                return priceA - priceB;
            } else {
                return a.name_ko.localeCompare(b.name_ko);
            }
        });

        return result;
    }, [hotels, searchQuery, selectedBrand, sortBy]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <HotelFilters brands={brands} />

            {filteredHotels.length === 0 ? (
                <EmptyState message="조건에 맞는 호텔이 없습니다." />
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
