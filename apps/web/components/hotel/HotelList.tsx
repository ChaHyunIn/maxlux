'use client';

import { useMemo, useEffect, useState } from 'react';
import type { Hotel } from '@/lib/types';
import { HotelCard } from './HotelCard';
import { HotelFilters } from './HotelFilters';
import { useFilterStore } from '@/stores/filterStore';
import { EmptyState } from '../shared/EmptyState';

interface HotelListProps {
    hotels: (Hotel & { min_price?: number })[];
}

export function HotelList({ hotels }: HotelListProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const { searchQuery, brand, sortBy } = useFilterStore();

    const brands = useMemo(() => {
        const uniqueBrands = new Set(hotels.map(h => h.brand).filter(Boolean) as string[]);
        return Array.from(uniqueBrands).sort();
    }, [hotels]);

    const filteredHotels = useMemo(() => {
        let result = [...hotels];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(h =>
                h.name_ko.toLowerCase().includes(q) ||
                h.name_en.toLowerCase().includes(q)
            );
        }

        if (brand) {
            result = result.filter(h => h.brand === brand);
        }

        result.sort((a, b) => {
            if (sortBy === 'price_asc') {
                const priceA = a.min_price ?? Infinity;
                const priceB = b.min_price ?? Infinity;
                return priceA - priceB;
            }
            return a.name_en.localeCompare(b.name_en);
        });

        return result;
    }, [hotels, searchQuery, brand, sortBy]);

    if (!mounted) {
        // Return a basic grid while waiting for hydration to avoid mismatch
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <HotelFilters brands={brands} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <HotelFilters brands={brands} />

            {filteredHotels.length === 0 ? (
                <EmptyState message="검색 결과가 없거나 조건을 만족하는 호텔이 없습니다." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            )}
        </div>
    );
}
