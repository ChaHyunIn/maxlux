'use client'
import { Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCalendarData } from '@/hooks/useCalendarData';
import { getHotelName } from '@/lib/hotelUtils';
import { getRelativeTime, formatAbsoluteTime } from '@/lib/utils';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarLegend } from './CalendarLegend';
import { DayDetailModal } from './DayDetailModal';
import { MonthGrid } from './MonthGrid';
import { SniperFilters } from './SniperFilters';
import type { DailyRate, Hotel } from '@/lib/types';

export function HeatmapCalendar({ 
    rates, 
    hotel, 
    targetMonth 
}: { 
    rates: DailyRate[], 
    hotel: Hotel,
    targetMonth?: string
}) {
    const t = useTranslations('calendar');
    const tTime = useTranslations('time');
    const locale = useLocale();
    const { selectedRate, modalOpen, closeDayDetail } = useCalendarStore();
    const { refundableRateMap, p25, p75, lastScraped, groupedByMonth } = useCalendarData(rates);

    const hotelName = getHotelName(hotel, locale);

    if (rates.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 bg-slate-50 rounded-xl">
                {t('noData')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold">{hotelName} {t('title')}</h2>
                {lastScraped && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('lastUpdated', {
                            absoluteTime: formatAbsoluteTime(lastScraped, locale, tTime),
                            relativeTime: getRelativeTime(lastScraped, tTime)
                        })}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 px-2">
                <SniperFilters />
                <div className="md:ml-auto">
                    <CalendarLegend />
                </div>
            </div>
            <div className="space-y-8">
                {groupedByMonth
                    .filter(([key]) => {
                        if (!targetMonth) return true;
                        // Normalize targetMonth (YYYY-MM to YYYY-M) to match key
                        const [y, m] = targetMonth.split('-');
                        const normalizedTarget = `${y}-${parseInt(m || '0', 10)}`;
                        return key === normalizedTarget;
                    })
                    .map(([key, monthRates]) => {
                        const parts = key.split('-').map(Number);
                    const year = parts[0];
                    const month = parts[1];
                    if (year === undefined || month === undefined) return null;
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
                })
            }
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
