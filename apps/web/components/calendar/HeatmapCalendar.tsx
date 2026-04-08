'use client';

import { useMemo } from 'react';
import type { Hotel, DailyRate, PricePercentiles } from '@/lib/types';
import { MonthGrid } from './MonthGrid';
import { CalendarLegend } from './CalendarLegend';
import { format, parseISO, startOfMonth } from 'date-fns';

interface HeatmapCalendarProps {
    hotel: Hotel;
    rates: DailyRate[];
    percentiles: PricePercentiles;
}

export function HeatmapCalendar({ hotel, rates, percentiles }: HeatmapCalendarProps) {
    const { p25, p75 } = percentiles;

    const months = useMemo(() => {
        const grouped = new Map<string, DailyRate[]>();
        rates.forEach(rate => {
            const date = parseISO(rate.stay_date);
            const key = format(startOfMonth(date), 'yyyy-MM-dd');
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(rate);
        });

        return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([monthStart, monthRates]) => ({
            monthStart,
            rates: monthRates
        }));
    }, [rates]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
                <div /> {/* Placeholder for future SniperFilters */}
                <CalendarLegend />
            </div>

            {months.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground border rounded-2xl bg-muted/20">
                    <p className="text-lg font-medium">수집된 요금 데이터가 없습니다.</p>
                    <p className="text-sm mt-1">곧 크롤링 작업에 의해 업데이트 될 예정입니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                    {months.map(({ monthStart, rates }) => (
                        <MonthGrid
                            key={monthStart}
                            monthStart={monthStart}
                            rates={rates}
                            p25={p25}
                            p75={p75}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
