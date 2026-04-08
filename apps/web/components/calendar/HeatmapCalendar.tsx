'use client'
import { useMemo } from 'react';
import type { DailyRate, Hotel } from '@/lib/types';
import { MonthGrid } from './MonthGrid';
import { SniperFilters } from './SniperFilters';
import { CalendarLegend } from './CalendarLegend';
import { DayDetailModal } from './DayDetailModal';
import { getYear, getMonth } from 'date-fns';
import { FALLBACK_PERCENTILES } from '@/lib/constants';
import { useCalendarStore } from '@/stores/calendarStore';
import { useLocale, useTranslations } from 'next-intl';

export function HeatmapCalendar({ rates, hotel }: { rates: DailyRate[], hotel: Hotel }) {
    const t = useTranslations('calendar');
    const locale = useLocale();
    const { selectedRate, modalOpen, closeDayDetail } = useCalendarStore();

    const { p25, p75 } = useMemo(() => {
        const prices = rates.filter(r => !r.is_sold_out && r.price_krw).map(r => r.price_krw).sort((a, b) => a - b);
        if (prices.length === 0) return FALLBACK_PERCENTILES;
        return {
            p25: prices[Math.floor(prices.length * 0.25)],
            p75: prices[Math.floor(prices.length * 0.75)]
        };
    }, [rates]);

    const groupedByMonth = useMemo(() => {
        const groups: Record<string, DailyRate[]> = {};
        rates.forEach(rate => {
            const d = new Date(rate.stay_date);
            const key = `${getYear(d)}-${getMonth(d) + 1}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(rate);
        });
        return Object.entries(groups).sort((a, b) => {
            const [yA, mA] = a[0].split('-').map(Number);
            const [yB, mB] = b[0].split('-').map(Number);
            return yA !== yB ? yA - yB : mA - mB;
        });
    }, [rates]);

    const hotelName = locale === 'en' ? hotel.name_en : hotel.name_ko;

    if (rates.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 bg-slate-50 rounded-xl">
                {t('noData')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold px-2">{hotelName} {t('title')}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 px-2">
                <SniperFilters />
                <div className="md:ml-auto">
                    <CalendarLegend />
                </div>
            </div>
            <div className="space-y-8">
                {groupedByMonth.map(([key, monthRates]) => {
                    const [year, month] = key.split('-').map(Number);
                    return <MonthGrid key={key} year={year} month={month} rates={monthRates} p25={p25} p75={p75} />;
                })}
            </div>

            {/* DayDetail Modal */}
            <DayDetailModal
                open={modalOpen}
                onOpenChange={(open) => { if (!open) closeDayDetail(); }}
                rate={selectedRate}
                hotelId={hotel.id}
                hotelName={hotelName}
                bookingUrl={hotel.booking_url}
                p25={p25}
                p75={p75}
            />
        </div>
    );
}
