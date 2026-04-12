'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { getHotelName } from '@/lib/hotelUtils';
import { DayDetailModal } from './DayDetailModal';
import { MonthGrid } from './MonthGrid';
import type { Hotel, DailyRate } from '@/lib/types';

interface HeatmapCalendarProps {
    rates: DailyRate[];
    hotel: Hotel;
    targetMonth?: string; // YYYY-MM
}

export function HeatmapCalendar({ rates, hotel, targetMonth }: HeatmapCalendarProps) {
    const locale = useLocale();
    const hotelName = getHotelName(hotel, locale);
    const [selectedRate, setSelectedRate] = useState<DailyRate | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const ratesByMonth = useMemo(() => {
        const groups: Record<string, DailyRate[]> = {};
        rates.forEach(rate => {
            const date = new Date(rate.stay_date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(rate);
        });
        return groups;
    }, [rates]);

    const groupedByMonth = useMemo(() => {
        return Object.entries(ratesByMonth).sort((a, b) => {
            const [y1, m1] = a[0].split('-').map(Number);
            const [y2, m2] = b[0].split('-').map(Number);
            if (y1 !== y2) return (y1 ?? 0) - (y2 ?? 0);
            return (m1 ?? 0) - (m2 ?? 0);
        });
    }, [ratesByMonth]);

    const allPrices = rates.map(r => r.price_krw).filter((p): p is number => p !== null && p > 0);
    const sortedPrices = [...allPrices].sort((a, b) => a - b);
    const p25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)] || 0;
    const p75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)] || 0;

    const refundableRateMap = useMemo(() => {
        const map: Record<string, DailyRate> = {};
        rates.forEach(r => {
            if (r.is_refundable) {
                const existing = map[r.stay_date];
                if (!existing || (r.price_krw ?? 0) < (existing.price_krw ?? 0)) {
                    map[r.stay_date] = r;
                }
            }
        });
        return map;
    }, [rates]);

    const closeDayDetail = () => {
        setModalOpen(false);
        setSelectedRate(null);
    };

    const monthGrids = useMemo(() => {
        return groupedByMonth
            .filter(([key]) => {
                if (!targetMonth) return true;
                const [y, m] = targetMonth.split('-');
                const normalizedTarget = `${y}-${parseInt(m || '0', 10)}`;
                return key === normalizedTarget;
            })
            .map(([key, monthRates]) => {
                const parts = key.split('-').map(Number);
                const year = parts[0] ?? 0;
                const month = parts[1] ?? 0;
                return (
                    <MonthGrid
                        key={key}
                        year={year}
                        month={month}
                        rates={monthRates}
                        p25={p25}
                        p75={p75}
                        hotelSlug={hotel.slug}
                        showDetailsLink={!targetMonth}
                    />
                );
            });
    }, [groupedByMonth, targetMonth, hotel.slug, p25, p75]);

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {monthGrids}
            </div>
            <DayDetailModal
                open={modalOpen}
                onOpenChange={(open) => { if (!open) closeDayDetail(); }}
                rate={selectedRate}
                refundableRate={selectedRate ? refundableRateMap[selectedRate.stay_date] ?? null : null}
                hotelId={hotel.id}
                hotelName={hotelName}
                bookingUrl={hotel.booking_url}
                p25={p25}
                p75={p75}
            />
        </div>
    );
}
